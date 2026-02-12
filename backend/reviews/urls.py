from django.urls import path
from .views import CreateReviewView, RestaurantReviewListView

urlpatterns = [
    path('<slug:slug>/reviews/', RestaurantReviewListView.as_view(), name='restaurant-reviews'),
    path('<slug:slug>/reviews/create/<str:order_number>/', CreateReviewView.as_view(), name='create-review'),
]
