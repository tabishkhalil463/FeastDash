from decimal import Decimal
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import CustomUser
from restaurants.models import Restaurant
from menu.models import MenuCategory, MenuItem
from orders.models import Order, OrderItem
from .models import Review


class ReviewTests(APITestCase):
    def setUp(self):
        self.customer = CustomUser.objects.create_user(
            username='cust', email='cust@test.com', password='test1234',
            first_name='Cust', last_name='User', user_type='customer',
        )
        self.owner = CustomUser.objects.create_user(
            username='owner', email='owner@test.com', password='test1234',
            user_type='restaurant_owner',
        )
        self.restaurant = Restaurant.objects.create(
            owner=self.owner, name='Test Resto', slug='test-resto',
            address='1 St', city='Karachi', phone='021111', email='r@t.com',
            cuisine_type='Pakistani', is_active=True, is_approved=True,
            delivery_fee=Decimal('100'), minimum_order=Decimal('200'),
            estimated_delivery_time=30,
            opening_time='10:00:00', closing_time='23:00:00',
        )
        cat = MenuCategory.objects.create(restaurant=self.restaurant, name='Main')
        self.item = MenuItem.objects.create(
            category=cat, restaurant=self.restaurant, name='Item 1',
            slug='item-1', price=Decimal('300'), is_available=True,
        )
        self.order = Order.objects.create(
            user=self.customer, restaurant=self.restaurant,
            status='delivered', payment_method='cod', payment_status='paid',
            total_amount=Decimal('300'), delivery_fee=Decimal('100'),
            tax_amount=Decimal('15'), grand_total=Decimal('415'),
            delivery_address='123 Test St', delivery_city='Karachi',
        )
        OrderItem.objects.create(order=self.order, menu_item=self.item, quantity=1, price=Decimal('300'))

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_create_review(self):
        self._auth(self.customer)
        resp = self.client.post(
            f'/api/restaurants/{self.restaurant.slug}/reviews/create/{self.order.order_number}/',
            {'rating': 5, 'comment': 'Excellent food!'},
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['rating'], 5)

    def test_duplicate_review(self):
        self._auth(self.customer)
        self.client.post(
            f'/api/restaurants/{self.restaurant.slug}/reviews/create/{self.order.order_number}/',
            {'rating': 5, 'comment': 'Great!'},
        )
        resp = self.client.post(
            f'/api/restaurants/{self.restaurant.slug}/reviews/create/{self.order.order_number}/',
            {'rating': 4, 'comment': 'Again'},
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_review_updates_restaurant_rating(self):
        self._auth(self.customer)
        self.client.post(
            f'/api/restaurants/{self.restaurant.slug}/reviews/create/{self.order.order_number}/',
            {'rating': 4},
        )
        self.restaurant.refresh_from_db()
        self.assertEqual(float(self.restaurant.average_rating), 4.0)
        self.assertEqual(self.restaurant.total_reviews, 1)
