from django.contrib import admin
from .models import Restaurant, RestaurantCategory


@admin.register(RestaurantCategory)
class RestaurantCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'city', 'cuisine_type', 'is_active', 'is_approved', 'average_rating']
    list_filter = ['is_active', 'is_approved', 'city', 'cuisine_type']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'city']
