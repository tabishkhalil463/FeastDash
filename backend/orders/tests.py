from decimal import Decimal
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import CustomUser
from restaurants.models import Restaurant
from menu.models import MenuCategory, MenuItem
from .models import Cart, Order


class OrderTests(APITestCase):
    def setUp(self):
        self.customer = CustomUser.objects.create_user(
            username='cust', email='cust@test.com', password='test1234',
            first_name='Cust', last_name='User', user_type='customer',
            city='Karachi',
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
        self.restaurant2 = Restaurant.objects.create(
            owner=self.owner, name='Other Resto', slug='other-resto',
            address='2 St', city='Karachi', phone='021222', email='r2@t.com',
            cuisine_type='Chinese', is_active=True, is_approved=True,
            delivery_fee=Decimal('80'), minimum_order=Decimal('100'),
            estimated_delivery_time=25,
            opening_time='10:00:00', closing_time='23:00:00',
        )
        cat = MenuCategory.objects.create(restaurant=self.restaurant, name='Main')
        cat2 = MenuCategory.objects.create(restaurant=self.restaurant2, name='Main')
        self.item1 = MenuItem.objects.create(
            category=cat, restaurant=self.restaurant, name='Item 1',
            slug='item-1', price=Decimal('300'), is_available=True,
        )
        self.item2 = MenuItem.objects.create(
            category=cat, restaurant=self.restaurant, name='Item 2',
            slug='item-2', price=Decimal('250'), is_available=True,
        )
        self.item_other = MenuItem.objects.create(
            category=cat2, restaurant=self.restaurant2, name='Other Item',
            slug='other-item', price=Decimal('200'), is_available=True,
        )

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_add_to_cart(self):
        self._auth(self.customer)
        resp = self.client.post('/api/cart/add/', {'menu_item_id': self.item1.id, 'quantity': 1})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['items_count'], 1)

    def test_add_different_restaurant_to_cart(self):
        self._auth(self.customer)
        self.client.post('/api/cart/add/', {'menu_item_id': self.item1.id, 'quantity': 1})
        resp = self.client.post('/api/cart/add/', {'menu_item_id': self.item_other.id, 'quantity': 1})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(resp.data.get('conflict'))

    def test_create_order(self):
        self._auth(self.customer)
        self.client.post('/api/cart/add/', {'menu_item_id': self.item1.id, 'quantity': 1})
        resp = self.client.post('/api/orders/create/', {
            'delivery_address': '123 Test St',
            'delivery_city': 'Karachi',
            'payment_method': 'cod',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('order_number', resp.data)
        self.assertFalse(Cart.objects.filter(user=self.customer).exists())

    def test_order_status_update(self):
        self._auth(self.customer)
        self.client.post('/api/cart/add/', {'menu_item_id': self.item1.id, 'quantity': 1})
        order_resp = self.client.post('/api/orders/create/', {
            'delivery_address': '123 Test St', 'delivery_city': 'Karachi', 'payment_method': 'cod',
        })
        order_number = order_resp.data['order_number']

        self._auth(self.owner)
        resp = self.client.patch(f'/api/restaurant/orders/{order_number}/update/', {'status': 'confirmed'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'confirmed')

    def test_cancel_order(self):
        self._auth(self.customer)
        self.client.post('/api/cart/add/', {'menu_item_id': self.item1.id, 'quantity': 1})
        order_resp = self.client.post('/api/orders/create/', {
            'delivery_address': '123 Test St', 'delivery_city': 'Karachi', 'payment_method': 'cod',
        })
        order_number = order_resp.data['order_number']
        resp = self.client.post(f'/api/orders/{order_number}/cancel/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'cancelled')

    def test_cancel_delivered_order(self):
        self._auth(self.customer)
        self.client.post('/api/cart/add/', {'menu_item_id': self.item1.id, 'quantity': 1})
        order_resp = self.client.post('/api/orders/create/', {
            'delivery_address': '123 Test St', 'delivery_city': 'Karachi', 'payment_method': 'cod',
        })
        order = Order.objects.get(order_number=order_resp.data['order_number'])
        order.status = 'delivered'
        order.save()
        resp = self.client.post(f'/api/orders/{order.order_number}/cancel/')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
