from django.urls import path
from . import views

urlpatterns = [
    path('<slug:restaurant_slug>/menu/', views.MenuItemListCreateView.as_view(), name='menu-items'),
    path('<slug:restaurant_slug>/menu/create/', views.MenuItemListCreateView.as_view(), name='menu-item-create'),
    path('<slug:restaurant_slug>/menu/<slug:item_slug>/', views.MenuItemUpdateDeleteView.as_view(), name='menu-item-detail'),
    path('<slug:restaurant_slug>/categories/', views.MenuCategoryListCreateView.as_view(), name='menu-categories'),
    path('<slug:restaurant_slug>/categories/<int:pk>/', views.MenuCategoryUpdateDeleteView.as_view(), name='menu-category-detail'),
]
