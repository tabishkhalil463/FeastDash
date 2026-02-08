import random
from decimal import Decimal
from datetime import datetime
from rest_framework import serializers
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem
from menu.models import MenuItem
from restaurants.models import Restaurant


# ─── Cart ───────────────────────────────────────────────────────────────

class CartMenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'price', 'discounted_price', 'image']


class CartItemSerializer(serializers.ModelSerializer):
    menu_item = CartMenuItemSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'menu_item', 'quantity', 'special_instructions', 'subtotal']

    def get_subtotal(self, obj):
        price = obj.menu_item.discounted_price or obj.menu_item.price
        return str(price * obj.quantity)


class CartRestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'slug', 'delivery_fee', 'minimum_order']


class CartSerializer(serializers.ModelSerializer):
    restaurant = CartRestaurantSerializer(read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'restaurant', 'items', 'total_amount', 'items_count', 'created_at']

    def get_total_amount(self, obj):
        total = Decimal('0')
        for item in obj.items.all():
            price = item.menu_item.discounted_price or item.menu_item.price
            total += price * item.quantity
        return str(total)

    def get_items_count(self, obj):
        return sum(i.quantity for i in obj.items.all())


class AddToCartSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    special_instructions = serializers.CharField(required=False, default='', allow_blank=True)

    def validate_menu_item_id(self, value):
        try:
            item = MenuItem.objects.select_related('restaurant').get(id=value)
        except MenuItem.DoesNotExist:
            raise serializers.ValidationError('Menu item not found.')
        if not item.is_available:
            raise serializers.ValidationError('This item is currently unavailable.')
        return value


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)


# ─── Orders ─────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_image = serializers.ImageField(source='menu_item.image', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'menu_item_name', 'menu_item_image', 'quantity',
            'price', 'subtotal', 'special_instructions',
        ]

    def get_subtotal(self, obj):
        return str(obj.price * obj.quantity)


class OrderCreateSerializer(serializers.Serializer):
    delivery_address = serializers.CharField()
    delivery_city = serializers.CharField()
    payment_method = serializers.ChoiceField(
        choices=['cod', 'jazzcash', 'easypaisa', 'card']
    )
    special_instructions = serializers.CharField(required=False, default='', allow_blank=True)

    def validate(self, data):
        user = self.context['request'].user
        try:
            cart = Cart.objects.prefetch_related('items__menu_item').get(user=user)
        except Cart.DoesNotExist:
            raise serializers.ValidationError('Your cart is empty.')

        items = list(cart.items.all())
        if not items:
            raise serializers.ValidationError('Your cart is empty.')

        total = sum(
            (i.menu_item.discounted_price or i.menu_item.price) * i.quantity
            for i in items
        )
        restaurant = cart.restaurant
        if total < restaurant.minimum_order:
            raise serializers.ValidationError(
                f'Minimum order is Rs. {restaurant.minimum_order}.'
            )

        data['_cart'] = cart
        data['_items'] = items
        data['_total'] = total
        data['_restaurant'] = restaurant
        return data

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        cart = validated_data['_cart']
        items = validated_data['_items']
        total = validated_data['_total']
        restaurant = validated_data['_restaurant']

        delivery_fee = restaurant.delivery_fee
        tax = (total * Decimal('0.05')).quantize(Decimal('0.01'))
        grand_total = total + delivery_fee + tax

        now = datetime.now()
        order_number = f"FD-{now.strftime('%Y%m%d')}-{random.randint(1000,9999)}"

        order = Order.objects.create(
            user=user,
            restaurant=restaurant,
            order_number=order_number,
            total_amount=total,
            delivery_fee=delivery_fee,
            tax_amount=tax,
            grand_total=grand_total,
            delivery_address=validated_data['delivery_address'],
            delivery_city=validated_data['delivery_city'],
            payment_method=validated_data['payment_method'],
            payment_status='paid' if validated_data['payment_method'] != 'cod' else 'pending',
            special_instructions=validated_data.get('special_instructions', ''),
        )

        order_items = []
        for ci in items:
            price = ci.menu_item.discounted_price or ci.menu_item.price
            order_items.append(OrderItem(
                order=order,
                menu_item=ci.menu_item,
                quantity=ci.quantity,
                price=price,
                special_instructions=ci.special_instructions,
            ))
        OrderItem.objects.bulk_create(order_items)

        cart.delete()
        return order


class OrderListSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name')
    restaurant_image = serializers.ImageField(source='restaurant.image')
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'restaurant_name', 'restaurant_image',
            'status', 'grand_total', 'items_count', 'payment_method',
            'payment_status', 'created_at',
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name')
    restaurant_image = serializers.ImageField(source='restaurant.image')
    restaurant_phone = serializers.CharField(source='restaurant.phone')
    driver_name = serializers.SerializerMethodField()
    driver_phone = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'restaurant', 'restaurant_name',
            'restaurant_image', 'restaurant_phone', 'status',
            'total_amount', 'delivery_fee', 'tax_amount', 'grand_total',
            'delivery_address', 'delivery_city', 'payment_method',
            'payment_status', 'special_instructions', 'estimated_delivery',
            'driver_name', 'driver_phone', 'items', 'created_at', 'updated_at',
        ]

    def get_driver_name(self, obj):
        if obj.driver:
            return f"{obj.driver.first_name} {obj.driver.last_name}".strip() or obj.driver.username
        return None

    def get_driver_phone(self, obj):
        return obj.driver.phone if obj.driver else None


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.CharField()

    RESTAURANT_TRANSITIONS = {
        'pending': ['confirmed'],
        'confirmed': ['preparing'],
        'preparing': ['ready'],
    }
    DRIVER_TRANSITIONS = {
        'ready': ['picked_up'],
        'picked_up': ['delivered'],
    }
    CUSTOMER_CANCEL = {
        'pending': ['cancelled'],
        'confirmed': ['cancelled'],
    }

    def validate_status(self, value):
        order = self.context['order']
        user = self.context['request'].user
        current = order.status

        if user.user_type == 'restaurant_owner':
            allowed = self.RESTAURANT_TRANSITIONS.get(current, [])
        elif user.user_type == 'delivery_driver':
            allowed = self.DRIVER_TRANSITIONS.get(current, [])
        elif user.user_type == 'customer':
            allowed = self.CUSTOMER_CANCEL.get(current, [])
        else:
            allowed = []

        if value not in allowed:
            raise serializers.ValidationError(
                f"Cannot change status from '{current}' to '{value}'."
            )
        return value
