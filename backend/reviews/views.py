from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Avg

from restaurants.models import Restaurant
from orders.models import Order
from .models import Review
from .serializers import ReviewCreateSerializer, ReviewListSerializer


class ReviewPagination(PageNumberPagination):
    page_size = 10


class CreateReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug, order_number):
        restaurant = get_object_or_404(Restaurant.objects.select_related('owner'), slug=slug)
        order = get_object_or_404(Order.objects.select_related('user', 'restaurant'), order_number=order_number)

        serializer = ReviewCreateSerializer(
            data=request.data,
            context={'request': request, 'restaurant': restaurant, 'order': order},
        )
        serializer.is_valid(raise_exception=True)
        review = serializer.save()

        # Update restaurant stats
        stats = Review.objects.filter(restaurant=restaurant).aggregate(avg=Avg('rating'))
        restaurant.average_rating = round(stats['avg'] or 0, 2)
        restaurant.total_reviews = Review.objects.filter(restaurant=restaurant).count()
        restaurant.save(update_fields=['average_rating', 'total_reviews'])

        return Response(ReviewListSerializer(review).data, status=status.HTTP_201_CREATED)


class RestaurantReviewListView(generics.ListAPIView):
    serializer_class = ReviewListSerializer
    pagination_class = ReviewPagination
    permission_classes = []

    def get_queryset(self):
        return Review.objects.filter(
            restaurant__slug=self.kwargs['slug']
        ).select_related('user', 'order').order_by('-created_at')
