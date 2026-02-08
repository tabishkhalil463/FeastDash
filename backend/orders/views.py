from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from accounts.permissions import IsCustomer, IsRestaurantOwner, IsDeliveryDriver
from menu.models import MenuItem
from .models import Cart, CartItem, Order
from .serializers import (
    CartSerializer, AddToCartSerializer, UpdateCartItemSerializer,
    OrderCreateSerializer, OrderListSerializer, OrderDetailSerializer,
    OrderStatusUpdateSerializer,
)


# ─── Cart ───────────────────────────────────────────────────────────────

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            cart = Cart.objects.prefetch_related('items__menu_item', 'restaurant').get(user=request.user)
            return Response(CartSerializer(cart).data)
        except Cart.DoesNotExist:
            return Response({
                'id': None, 'restaurant': None, 'items': [],
                'total_amount': '0', 'items_count': 0, 'created_at': None,
            })

    def delete(self, request):
        Cart.objects.filter(user=request.user).delete()
        return Response({'message': 'Cart cleared.'})


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        menu_item = MenuItem.objects.select_related('restaurant').get(
            id=serializer.validated_data['menu_item_id']
        )
        restaurant = menu_item.restaurant
        quantity = serializer.validated_data['quantity']
        instructions = serializer.validated_data.get('special_instructions', '')

        cart = Cart.objects.filter(user=request.user).first()

        if cart and cart.restaurant_id != restaurant.id:
            return Response(
                {
                    'error': f'Your cart has items from {cart.restaurant.name}. '
                             'Clear cart first or continue with current restaurant.',
                    'conflict': True,
                    'current_restaurant': cart.restaurant.name,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not cart:
            cart = Cart.objects.create(user=request.user, restaurant=restaurant)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, menu_item=menu_item,
            defaults={'quantity': quantity, 'special_instructions': instructions},
        )
        if not created:
            cart_item.quantity += quantity
            if instructions:
                cart_item.special_instructions = instructions
            cart_item.save()

        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        cart_item = get_object_or_404(CartItem, pk=pk, cart__user=request.user)
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        qty = serializer.validated_data['quantity']
        cart = cart_item.cart

        if qty == 0:
            cart_item.delete()
            if not cart.items.exists():
                cart.delete()
                return Response({
                    'id': None, 'restaurant': None, 'items': [],
                    'total_amount': '0', 'items_count': 0, 'created_at': None,
                })
        else:
            cart_item.quantity = qty
            cart_item.save()

        cart.refresh_from_db()
        return Response(CartSerializer(cart).data)


class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        cart_item = get_object_or_404(CartItem, pk=pk, cart__user=request.user)
        cart = cart_item.cart
        cart_item.delete()

        if not cart.items.exists():
            cart.delete()
            return Response({
                'id': None, 'restaurant': None, 'items': [],
                'total_amount': '0', 'items_count': 0, 'created_at': None,
            })

        cart.refresh_from_db()
        return Response(CartSerializer(cart).data)


# ─── Orders ─────────────────────────────────────────────────────────────

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        serializer = OrderCreateSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class CustomerOrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = OrderListSerializer
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Order.objects.filter(user=self.request.user).order_by('-created_at')
        s = self.request.query_params.get('status')
        if s:
            qs = qs.filter(status=s)
        return qs


class CustomerOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        return Response(OrderDetailSerializer(order).data)


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        if order.status not in ('pending', 'confirmed'):
            return Response(
                {'error': 'Order can only be cancelled when pending or confirmed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = 'cancelled'
        order.save()
        return Response(OrderDetailSerializer(order).data)


class RestaurantOrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsRestaurantOwner]
    serializer_class = OrderListSerializer
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Order.objects.filter(
            restaurant__owner=self.request.user
        ).order_by('-created_at')
        s = self.request.query_params.get('status')
        if s:
            qs = qs.filter(status=s)
        return qs


class RestaurantOrderUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsRestaurantOwner]

    def patch(self, request, order_number):
        order = get_object_or_404(
            Order, order_number=order_number, restaurant__owner=request.user,
        )
        serializer = OrderStatusUpdateSerializer(
            data=request.data,
            context={'order': order, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data['status']
        order.save()
        return Response(OrderDetailSerializer(order).data)


# ─── Driver ─────────────────────────────────────────────────────────────

class DriverAvailableOrdersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsDeliveryDriver]
    serializer_class = OrderListSerializer

    def get_queryset(self):
        city = self.request.user.city
        qs = Order.objects.filter(status='ready').order_by('-created_at')
        if city:
            qs = qs.filter(delivery_city__iexact=city)
        return qs


class DriverAcceptOrderView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryDriver]

    def post(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, status='ready')
        if Order.objects.filter(driver=request.user, status='picked_up').exists():
            return Response(
                {'error': 'You already have an active delivery.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.driver = request.user
        order.status = 'picked_up'
        order.save()
        return Response(OrderDetailSerializer(order).data)


class DriverUpdateOrderView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryDriver]

    def patch(self, request, order_number):
        order = get_object_or_404(
            Order, order_number=order_number, driver=request.user,
        )
        serializer = OrderStatusUpdateSerializer(
            data=request.data,
            context={'order': order, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data['status']
        order.save()
        return Response(OrderDetailSerializer(order).data)


class DriverActiveOrderView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryDriver]

    def get(self, request):
        order = Order.objects.filter(
            driver=request.user, status='picked_up',
        ).order_by('-created_at').first()
        if order:
            return Response(OrderDetailSerializer(order).data)
        return Response(None)


class DriverOrderHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsDeliveryDriver]
    serializer_class = OrderListSerializer

    def get_queryset(self):
        return Order.objects.filter(
            driver=self.request.user, status='delivered',
        ).order_by('-created_at')
