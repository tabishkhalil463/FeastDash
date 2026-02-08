from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, DeliveryDriverProfile


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'user_type', 'city', 'is_active']
    list_filter = ['user_type', 'is_active', 'city']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone', 'address', 'city', 'profile_image', 'user_type')}),
    )


@admin.register(DeliveryDriverProfile)
class DeliveryDriverProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'vehicle_type', 'is_available']
    list_filter = ['is_available', 'vehicle_type']
