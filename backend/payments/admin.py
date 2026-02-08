from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'order', 'user', 'amount', 'payment_method', 'payment_status', 'created_at']
    list_filter = ['payment_status', 'payment_method']
    search_fields = ['transaction_id', 'order__order_number']
