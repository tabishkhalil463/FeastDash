from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from accounts.permissions import IsAdminUser
from accounts.models import CustomUser
from accounts.serializers import UserProfileSerializer
from restaurants.models import Restaurant
from restaurants.serializers import RestaurantListSerializer
from orders.models import Order
from orders.serializers import OrderListSerializer


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        total_users = CustomUser.objects.count()
        total_restaurants = Restaurant.objects.count()
        total_orders = Order.objects.count()
        total_revenue = Order.objects.filter(status='delivered').aggregate(
            total=Sum('grand_total')
        )['total'] or 0

        # Orders per day (last 30 days)
        orders_per_day = list(
            Order.objects.filter(created_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        for entry in orders_per_day:
            entry['date'] = entry['date'].isoformat()

        # Revenue per day (last 30 days)
        revenue_per_day = list(
            Order.objects.filter(created_at__gte=thirty_days_ago, status='delivered')
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(amount=Sum('grand_total'))
            .order_by('date')
        )
        for entry in revenue_per_day:
            entry['date'] = entry['date'].isoformat()
            entry['amount'] = str(entry['amount'])

        # Recent orders
        recent_orders = Order.objects.select_related('user', 'restaurant').order_by('-created_at')[:10]
        recent_orders_data = [
            {
                'order_number': o.order_number,
                'customer': o.user.get_full_name() or o.user.username,
                'restaurant': o.restaurant.name,
                'grand_total': str(o.grand_total),
                'status': o.status,
                'payment_status': o.payment_status,
                'created_at': o.created_at.isoformat(),
            }
            for o in recent_orders
        ]

        # Recent users
        recent_users = CustomUser.objects.order_by('-created_at')[:10]
        recent_users_data = [
            {
                'id': u.id,
                'name': u.get_full_name() or u.username,
                'email': u.email,
                'user_type': u.user_type,
                'created_at': u.created_at.isoformat(),
            }
            for u in recent_users
        ]

        # Orders by status
        orders_by_status = list(
            Order.objects.values('status').annotate(count=Count('id')).order_by('status')
        )

        # Popular restaurants (top 5 by order count)
        popular_restaurants = list(
            Restaurant.objects.annotate(order_count=Count('orders'))
            .order_by('-order_count')[:5]
            .values('id', 'name', 'slug', 'cuisine_type', 'average_rating', 'order_count')
        )
        for r in popular_restaurants:
            r['average_rating'] = str(r['average_rating'])

        return Response({
            'total_users': total_users,
            'total_restaurants': total_restaurants,
            'total_orders': total_orders,
            'total_revenue': str(total_revenue),
            'orders_per_day': orders_per_day,
            'revenue_per_day': revenue_per_day,
            'recent_orders': recent_orders_data,
            'recent_users': recent_users_data,
            'orders_by_status': orders_by_status,
            'popular_restaurants': popular_restaurants,
        })


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserProfileSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = CustomUser.objects.all().order_by('-created_at')
        user_type = self.request.query_params.get('user_type')
        is_active = self.request.query_params.get('is_active')
        search = self.request.query_params.get('search')

        if user_type:
            qs = qs.filter(user_type=user_type)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ('true', '1'))
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        return qs


class AdminUserToggleActiveView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        return Response({
            'id': user.id,
            'is_active': user.is_active,
            'message': f"User {'activated' if user.is_active else 'deactivated'}.",
        })


class AdminRestaurantListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = RestaurantListSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Restaurant.objects.select_related('owner').order_by('-created_at')
        is_approved = self.request.query_params.get('is_approved')
        is_active = self.request.query_params.get('is_active')
        search = self.request.query_params.get('search')

        if is_approved is not None:
            qs = qs.filter(is_approved=is_approved.lower() in ('true', '1'))
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ('true', '1'))
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(cuisine_type__icontains=search) |
                Q(owner__email__icontains=search)
            )
        return qs


class AdminRestaurantApprovalView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            restaurant = Restaurant.objects.get(pk=pk)
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')  # 'approve' or 'reject'
        if action == 'approve':
            restaurant.is_approved = True
        elif action == 'reject':
            restaurant.is_approved = False
        else:
            return Response({'error': 'Action must be "approve" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)

        restaurant.save(update_fields=['is_approved'])
        return Response({
            'id': restaurant.id,
            'name': restaurant.name,
            'is_approved': restaurant.is_approved,
            'message': f"Restaurant {'approved' if restaurant.is_approved else 'rejected'}.",
        })


class AdminOrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = OrderListSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Order.objects.select_related('user', 'restaurant').order_by('-created_at')
        order_status = self.request.query_params.get('status')
        payment_status = self.request.query_params.get('payment_status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if order_status:
            qs = qs.filter(status=order_status)
        if payment_status:
            qs = qs.filter(payment_status=payment_status)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs
