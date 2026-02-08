from rest_framework import serializers
from django.utils.text import slugify
from .models import MenuCategory, MenuItem


class MenuItemListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'discounted_price',
            'image', 'is_available', 'is_vegetarian', 'is_spicy',
            'preparation_time', 'category', 'category_name',
        ]


class MenuItemDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'discounted_price',
            'image', 'is_available', 'is_vegetarian', 'is_spicy',
            'preparation_time', 'category', 'category_name', 'restaurant',
            'restaurant_name', 'created_at',
        ]


class MenuItemCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            'name', 'description', 'price', 'discounted_price', 'image',
            'category', 'is_available', 'is_vegetarian', 'is_spicy',
            'preparation_time',
        ]

    def create(self, validated_data):
        validated_data['restaurant'] = self.context['restaurant']
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
        while MenuItem.objects.filter(slug=slug, restaurant=self.context['restaurant']).exists():
            slug = f"{base}-{n}"
            n += 1
        return slug


class MenuCategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'sort_order', 'is_active', 'items_count']

    def get_items_count(self, obj):
        return obj.items.count()


class MenuCategoryWithItemsSerializer(serializers.ModelSerializer):
    items = MenuItemListSerializer(many=True, read_only=True)

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'sort_order', 'is_active', 'items']
