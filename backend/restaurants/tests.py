from decimal import Decimal
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import CustomUser
from .models import Restaurant


class RestaurantTests(APITestCase):
    def setUp(self):
        self.customer = CustomUser.objects.create_user(
            username='cust', email='cust@test.com', password='test1234',
            first_name='Cust', last_name='User', user_type='customer',
        )
        self.owner = CustomUser.objects.create_user(
            username='owner', email='owner@test.com', password='test1234',
            first_name='Owner', last_name='User', user_type='restaurant_owner',
        )
        self.restaurant = Restaurant.objects.create(
            owner=self.owner, name='Test Restaurant', slug='test-restaurant',
            description='A test restaurant', address='123 Main St',
            city='Karachi', phone='02112345678', email='r@test.com',
            cuisine_type='Pakistani', is_active=True, is_approved=True,
            delivery_fee=Decimal('100'), minimum_order=Decimal('200'),
            estimated_delivery_time=30,
            opening_time='10:00:00', closing_time='23:00:00',
        )

    def _auth(self, user):
        resp = self.client.post('/api/auth/login/', {
            'email': user.email, 'password': 'test1234',
        })
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["tokens"]["access"]}')

    def test_restaurant_list(self):
        resp = self.client.get('/api/restaurants/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data['results']), 1)

    def test_restaurant_detail(self):
        resp = self.client.get(f'/api/restaurants/{self.restaurant.slug}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Test Restaurant')

    def test_restaurant_create_by_owner(self):
        owner2 = CustomUser.objects.create_user(
            username='owner2', email='owner2@test.com', password='test1234',
            user_type='restaurant_owner',
        )
        self._auth(owner2)
        resp = self.client.post('/api/restaurants/create/', {
            'name': 'New Restaurant', 'description': 'New', 'address': '456 St',
            'city': 'Lahore', 'phone': '04212345678', 'email': 'new@test.com',
            'cuisine_type': 'Fast Food', 'delivery_fee': 80, 'minimum_order': 150,
            'estimated_delivery_time': 25,
            'opening_time': '10:00:00', 'closing_time': '23:00:00',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_restaurant_create_by_customer(self):
        self._auth(self.customer)
        resp = self.client.post('/api/restaurants/create/', {
            'name': 'Bad', 'description': 'Bad', 'address': '1', 'city': 'X',
            'phone': '111', 'email': 'x@x.com', 'cuisine_type': 'X',
            'delivery_fee': 0, 'minimum_order': 0, 'estimated_delivery_time': 10,
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_restaurant_filter_by_city(self):
        resp = self.client.get('/api/restaurants/?city=Karachi')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for r in resp.data['results']:
            self.assertEqual(r['city'], 'Karachi')
