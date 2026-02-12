from django.urls import path
from . import views

urlpatterns = [
    path('', views.RestaurantListView.as_view(), name='restaurant-list'),
    path('create/', views.RestaurantCreateView.as_view(), name='restaurant-create'),
    path('categories/', views.RestaurantCategoryListView.as_view(), name='restaurant-categories'),
    path('my-restaurant/', views.RestaurantUpdateView.as_view(), name='my-restaurant'),
    path('dashboard/', views.RestaurantOwnerDashboardView.as_view(), name='restaurant-dashboard'),
    path('search/', views.SearchView.as_view(), name='search'),
    path('<slug:slug>/', views.RestaurantDetailView.as_view(), name='restaurant-detail'),
]
