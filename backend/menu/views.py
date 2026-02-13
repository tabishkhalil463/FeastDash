from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated, AllowAny, SAFE_METHODS
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from accounts.permissions import IsRestaurantOwner
from restaurants.models import Restaurant
from .models import MenuCategory, MenuItem
from .serializers import (
    MenuCategorySerializer,
    MenuItemListSerializer,
    MenuItemDetailSerializer,
    MenuItemCreateUpdateSerializer,
)


class IsOwnerOrReadOnly:
    """Mixin to check restaurant ownership."""
    def get_restaurant(self):
        slug = self.kwargs['restaurant_slug']
        return get_object_or_404(Restaurant, slug=slug)

    def check_owner(self, request, restaurant):
        if request.method not in SAFE_METHODS:
            if not request.user.is_authenticated or restaurant.owner != request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You are not the owner of this restaurant.")


class MenuCategoryListCreateView(IsOwnerOrReadOnly, generics.ListCreateAPIView):
    serializer_class = MenuCategorySerializer
    pagination_class = None

    def get_queryset(self):
        restaurant = self.get_restaurant()
        return MenuCategory.objects.filter(restaurant=restaurant)

    def perform_create(self, serializer):
        restaurant = self.get_restaurant()
        self.check_owner(self.request, restaurant)
        serializer.save(restaurant=restaurant)


class MenuCategoryUpdateDeleteView(IsOwnerOrReadOnly, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuCategorySerializer

    def get_queryset(self):
        restaurant = self.get_restaurant()
        return MenuCategory.objects.filter(restaurant=restaurant)

    def perform_update(self, serializer):
        restaurant = self.get_restaurant()
        self.check_owner(self.request, restaurant)
        serializer.save()

    def perform_destroy(self, instance):
        restaurant = self.get_restaurant()
        self.check_owner(self.request, restaurant)
        instance.delete()


class MenuItemListCreateView(IsOwnerOrReadOnly, generics.ListCreateAPIView):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_available', 'is_vegetarian']
    search_fields = ['name', 'description']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MenuItemCreateUpdateSerializer
        return MenuItemListSerializer

    def get_queryset(self):
        restaurant = self.get_restaurant()
        return MenuItem.objects.filter(restaurant=restaurant).select_related('category')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['restaurant'] = self.get_restaurant()
        return ctx

    def perform_create(self, serializer):
        restaurant = self.get_restaurant()
        self.check_owner(self.request, restaurant)
        serializer.save()


class MenuItemDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = MenuItemDetailSerializer

    def get_queryset(self):
        return MenuItem.objects.filter(
            restaurant__slug=self.kwargs['restaurant_slug']
        )

    def get_object(self):
        return get_object_or_404(
            self.get_queryset(), slug=self.kwargs['item_slug']
        )


class MenuItemUpdateDeleteView(IsOwnerOrReadOnly, generics.RetrieveUpdateDestroyAPIView):

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return MenuItemDetailSerializer
        return MenuItemCreateUpdateSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['restaurant'] = self.get_restaurant()
        return ctx

    def get_object(self):
        restaurant = self.get_restaurant()
        return get_object_or_404(
            MenuItem, slug=self.kwargs['item_slug'], restaurant=restaurant,
        )

    def perform_update(self, serializer):
        restaurant = self.get_restaurant()
        self.check_owner(self.request, restaurant)
        serializer.save()

    def perform_destroy(self, instance):
        restaurant = self.get_restaurant()
        self.check_owner(self.request, restaurant)
        instance.delete()
