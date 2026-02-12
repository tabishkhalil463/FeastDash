from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from orders.models import Order
from .services import PaymentService


class ProcessPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)

        if order.payment_status == 'paid':
            return Response(
                {'error': 'This order has already been paid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_method = request.data.get('payment_method', order.payment_method)
        payment_data = request.data.get('payment_data', {})

        result = PaymentService.process_payment(order, payment_method, payment_data)

        if result.get('success'):
            payment = result['payment']
            return Response({
                'success': True,
                'transaction_id': payment.transaction_id,
                'payment_status': payment.payment_status,
                'message': result.get('message', 'Payment processed successfully'),
            })
        else:
            payment = result.get('payment')
            return Response({
                'success': False,
                'transaction_id': payment.transaction_id if payment else None,
                'payment_status': payment.payment_status if payment else 'failed',
                'message': result.get('message', 'Payment failed. Please try again.'),
            }, status=status.HTTP_400_BAD_REQUEST)
