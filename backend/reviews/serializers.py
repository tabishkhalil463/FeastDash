from rest_framework import serializers
from .models import Review
from orders.models import Order


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment']

    def validate(self, attrs):
        request = self.context['request']
        restaurant = self.context['restaurant']
        order = self.context['order']

        if order.user != request.user:
            raise serializers.ValidationError('This order does not belong to you.')
        if order.restaurant != restaurant:
            raise serializers.ValidationError('This order is not from this restaurant.')
        if order.status != 'delivered':
            raise serializers.ValidationError('You can only review delivered orders.')
        if Review.objects.filter(order=order).exists():
            raise serializers.ValidationError('You have already reviewed this order.')
        return attrs

    def create(self, validated_data):
        return Review.objects.create(
            user=self.context['request'].user,
            restaurant=self.context['restaurant'],
            order=self.context['order'],
            **validated_data,
        )


class ReviewListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at', 'order_number']

    def get_user_name(self, obj):
        full = obj.user.get_full_name()
        return full if full.strip() else obj.user.username
