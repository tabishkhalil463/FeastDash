from django.urls import path
from . import views

urlpatterns = [
    # Cart
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/add/', views.AddToCartView.as_view(), name='cart-add'),
    path('cart/item/<int:pk>/update/', views.UpdateCartItemView.as_view(), name='cart-item-update'),
    path('cart/item/<int:pk>/remove/', views.RemoveCartItemView.as_view(), name='cart-item-remove'),
    # Customer orders
    path('orders/', views.CustomerOrderListView.as_view(), name='customer-orders'),
    path('orders/create/', views.CreateOrderView.as_view(), name='create-order'),
    path('orders/<str:order_number>/', views.CustomerOrderDetailView.as_view(), name='order-detail'),
    path('orders/<str:order_number>/cancel/', views.CancelOrderView.as_view(), name='cancel-order'),
    # Restaurant orders
    path('restaurant/orders/', views.RestaurantOrderListView.as_view(), name='restaurant-orders'),
    path('restaurant/orders/<str:order_number>/update/', views.RestaurantOrderUpdateView.as_view(), name='restaurant-order-update'),
    # Driver
    path('driver/available-orders/', views.DriverAvailableOrdersView.as_view(), name='driver-available-orders'),
    path('driver/orders/<str:order_number>/accept/', views.DriverAcceptOrderView.as_view(), name='driver-accept-order'),
    path('driver/orders/<str:order_number>/update/', views.DriverUpdateOrderView.as_view(), name='driver-update-order'),
    path('driver/active-order/', views.DriverActiveOrderView.as_view(), name='driver-active-order'),
    path('driver/order-history/', views.DriverOrderHistoryView.as_view(), name='driver-order-history'),
]
