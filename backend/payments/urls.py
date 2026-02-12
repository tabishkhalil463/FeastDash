from django.urls import path
from .views import ProcessPaymentView

urlpatterns = [
    path('payments/<str:order_number>/process/', ProcessPaymentView.as_view(), name='process-payment'),
]
