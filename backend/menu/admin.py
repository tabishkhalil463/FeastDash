from django.contrib import admin
from .models import MenuCategory, MenuItem


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'sort_order', 'is_active']
    list_filter = ['is_active', 'restaurant']


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'category', 'price', 'is_available']
    list_filter = ['is_available', 'is_vegetarian', 'is_spicy', 'restaurant']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
