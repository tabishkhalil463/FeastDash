from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Q
from accounts.permissions import IsRestaurantOwner
from .models import Restaurant, RestaurantCategory
from .serializers import (
    RestaurantCategorySerializer,
    RestaurantListSerializer,
    RestaurantDetailSerializer,
    RestaurantCreateUpdateSerializer,
)


class RestaurantCategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RestaurantCategorySerializer
    queryset = RestaurantCategory.objects.filter(is_active=True)
    pagination_class = None


class RestaurantListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RestaurantListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'cuisine_type']
    search_fields = ['name', 'description', 'cuisine_type']
    ordering_fields = ['average_rating', 'delivery_fee', 'estimated_delivery_time', 'created_at']
    ordering = ['-average_rating']

    def get_queryset(self):
        qs = Restaurant.objects.filter(is_active=True, is_approved=True)
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(cuisine_type__icontains=category)
        return qs


class RestaurantDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = RestaurantDetailSerializer
    lookup_field = 'slug'
    queryset = Restaurant.objects.filter(is_active=True, is_approved=True)


class RestaurantCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsRestaurantOwner]
    serializer_class = RestaurantCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save()

    def create(self, request, *args, **kwargs):
        if Restaurant.objects.filter(owner=request.user).exists():
            return Response(
                {'error': 'You already have a restaurant.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().create(request, *args, **kwargs)


class RestaurantUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsRestaurantOwner]
    serializer_class = RestaurantCreateUpdateSerializer

    def get_object(self):
        return generics.get_object_or_404(Restaurant, owner=self.request.user)

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = RestaurantDetailSerializer(instance)
        return Response(serializer.data)


class RestaurantOwnerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def get(self, request):
        try:
            restaurant = Restaurant.objects.get(owner=request.user)
        except Restaurant.DoesNotExist:
            return Response({'has_restaurant': False})

        from orders.models import Order
        orders = Order.objects.filter(restaurant=restaurant)

        total_orders = orders.count()
        total_revenue = orders.filter(status='delivered').aggregate(
            total=Sum('grand_total')
        )['total'] or 0
        pending_orders_count = orders.filter(
            status__in=['pending', 'confirmed', 'preparing']
        ).count()

        recent_orders = orders.order_by('-created_at')[:5].values(
            'order_number', 'user__first_name', 'user__last_name',
            'grand_total', 'status', 'created_at',
        )
        recent_list = []
        for o in recent_orders:
            recent_list.append({
                'order_number': o['order_number'],
                'customer': f"{o['user__first_name']} {o['user__last_name']}".strip(),
                'total': str(o['grand_total']),
                'status': o['status'],
                'created_at': o['created_at'],
            })

        serializer = RestaurantDetailSerializer(restaurant)
        return Response({
            'has_restaurant': True,
            'restaurant': serializer.data,
            'stats': {
                'total_orders': total_orders,
                'total_revenue': str(total_revenue),
                'average_rating': str(restaurant.average_rating),
                'pending_orders_count': pending_orders_count,
            },
            'recent_orders': recent_list,
        })
