from rest_framework import serializers
from django.utils.text import slugify
from .models import Restaurant, RestaurantCategory


class RestaurantCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantCategory
        fields = ['id', 'name', 'slug', 'image', 'is_active']


class RestaurantListSerializer(serializers.ModelSerializer):
    formatted_delivery_fee = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'slug', 'image', 'logo', 'cuisine_type',
            'average_rating', 'total_reviews', 'delivery_fee',
            'formatted_delivery_fee', 'estimated_delivery_time',
            'minimum_order', 'is_active', 'city',
        ]

    def get_formatted_delivery_fee(self, obj):
        return f"Rs. {obj.delivery_fee:,.0f}"


class RestaurantDetailSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    menu_categories = serializers.SerializerMethodField()
    formatted_delivery_fee = serializers.SerializerMethodField()
    formatted_minimum_order = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id', 'owner', 'owner_name', 'name', 'slug', 'description',
            'address', 'city', 'phone', 'email', 'image', 'logo',
            'cuisine_type', 'opening_time', 'closing_time', 'is_active',
            'is_approved', 'average_rating', 'total_reviews', 'minimum_order',
            'formatted_minimum_order', 'delivery_fee', 'formatted_delivery_fee',
            'estimated_delivery_time', 'created_at', 'menu_categories',
        ]

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}".strip() or obj.owner.username

    def get_formatted_delivery_fee(self, obj):
        return f"Rs. {obj.delivery_fee:,.0f}"

    def get_formatted_minimum_order(self, obj):
        return f"Rs. {obj.minimum_order:,.0f}"

    def get_menu_categories(self, obj):
        from menu.serializers import MenuCategoryWithItemsSerializer
        categories = obj.menu_categories.filter(is_active=True).order_by('sort_order', 'name')
        return MenuCategoryWithItemsSerializer(categories, many=True).data


class RestaurantCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            'name', 'description', 'address', 'city', 'phone', 'email',
            'image', 'logo', 'cuisine_type', 'opening_time', 'closing_time',
            'minimum_order', 'delivery_fee', 'estimated_delivery_time',
        ]

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        validated_data['slug'] = self._unique_slug(validated_data['name'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'name' in validated_data and validated_data['name'] != instance.name:
            validated_data['slug'] = self._unique_slug(validated_data['name'])
        return super().update(instance, validated_data)

    def _unique_slug(self, name):
        slug = slugify(name)
        base = slug
        n = 1
        while Restaurant.objects.filter(slug=slug).exists():
            slug = f"{base}-{n}"
            n += 1
        return slug
