import time
import random
import uuid

from django.utils import timezone
from .models import Payment


class PaymentService:
    @staticmethod
    def process_payment(order, payment_method, payment_data=None):
        if payment_method == 'cod':
            return PaymentService._process_cod(order)
        elif payment_method == 'jazzcash':
            return PaymentService._process_jazzcash(order, payment_data)
        elif payment_method == 'easypaisa':
            return PaymentService._process_easypaisa(order, payment_data)
        elif payment_method == 'card':
            return PaymentService._process_card(order, payment_data)
        return {'success': False, 'message': 'Invalid payment method'}

    @staticmethod
    def _process_cod(order):
        payment = Payment.objects.create(
            order=order,
            user=order.user,
            amount=order.grand_total,
            payment_method='cod',
            payment_status='pending',
            transaction_id=f"FD-COD-{uuid.uuid4().hex[:8].upper()}",
        )
        return {'success': True, 'payment': payment, 'message': 'Pay on delivery'}

    @staticmethod
    def _process_jazzcash(order, data):
        time.sleep(1)
        success = random.random() < 0.9
        payment = Payment.objects.create(
            order=order,
            user=order.user,
            amount=order.grand_total,
            payment_method='jazzcash',
            payment_status='completed' if success else 'failed',
            phone_number=data.get('phone_number', '') if data else '',
            transaction_id=f"FD-JC-{uuid.uuid4().hex[:8].upper()}",
            gateway_response={'simulated': True, 'success': success},
        )
        if success:
            order.payment_status = 'paid'
            order.save()
        return {'success': success, 'payment': payment}

    @staticmethod
    def _process_easypaisa(order, data):
        time.sleep(1)
        success = random.random() < 0.9
        payment = Payment.objects.create(
            order=order,
            user=order.user,
            amount=order.grand_total,
            payment_method='easypaisa',
            payment_status='completed' if success else 'failed',
            phone_number=data.get('phone_number', '') if data else '',
            transaction_id=f"FD-EP-{uuid.uuid4().hex[:8].upper()}",
            gateway_response={'simulated': True, 'success': success},
        )
        if success:
            order.payment_status = 'paid'
            order.save()
        return {'success': success, 'payment': payment}

    @staticmethod
    def _process_card(order, data):
        time.sleep(1)
        success = random.random() < 0.9
        payment = Payment.objects.create(
            order=order,
            user=order.user,
            amount=order.grand_total,
            payment_method='card',
            payment_status='completed' if success else 'failed',
            card_last_four=data.get('card_number', '')[-4:] if data else '',
            transaction_id=f"FD-CARD-{uuid.uuid4().hex[:8].upper()}",
            gateway_response={'simulated': True, 'success': success},
        )
        if success:
            order.payment_status = 'paid'
            order.save()
        return {'success': success, 'payment': payment}

    @staticmethod
    def confirm_cod_delivery(payment):
        payment.payment_status = 'completed'
        payment.paid_at = timezone.now()
        payment.save()
        payment.order.payment_status = 'paid'
        payment.order.save()
