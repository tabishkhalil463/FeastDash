from django.urls import path
from .admin_views import (
    AdminDashboardStatsView,
    AdminUserListView,
    AdminUserToggleActiveView,
    AdminRestaurantListView,
    AdminRestaurantApprovalView,
    AdminOrderListView,
)

urlpatterns = [
    path('dashboard/', AdminDashboardStatsView.as_view(), name='admin-dashboard'),
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:pk>/toggle-active/', AdminUserToggleActiveView.as_view(), name='admin-user-toggle'),
    path('restaurants/', AdminRestaurantListView.as_view(), name='admin-restaurants'),
    path('restaurants/<int:pk>/approve/', AdminRestaurantApprovalView.as_view(), name='admin-restaurant-approve'),
    path('orders/', AdminOrderListView.as_view(), name='admin-orders'),
]
