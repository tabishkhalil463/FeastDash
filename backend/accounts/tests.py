from rest_framework.test import APITestCase
from rest_framework import status
from .models import CustomUser


class AuthTests(APITestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass1234',
            'confirm_password': 'testpass1234',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '03001234567',
        }
        self.user = CustomUser.objects.create_user(
            username='existing', email='existing@example.com',
            password='testpass1234', first_name='Existing', last_name='User',
            phone='03009876543', user_type='customer',
        )

    def _get_token(self, email='existing@example.com', password='testpass1234'):
        resp = self.client.post('/api/auth/login/', {'email': email, 'password': password})
        return resp.data.get('tokens', {}).get('access') if resp.status_code == 200 else None

    def test_user_registration_success(self):
        resp = self.client.post('/api/auth/register/', self.user_data)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', resp.data)
        self.assertIn('access', resp.data['tokens'])

    def test_user_registration_duplicate_email(self):
        data = {**self.user_data, 'email': 'existing@example.com'}
        resp = self.client.post('/api/auth/register/', data)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_invalid_phone(self):
        data = {**self.user_data, 'phone': '12345'}
        resp = self.client.post('/api/auth/register/', data)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        resp = self.client.post('/api/auth/login/', {
            'email': 'existing@example.com', 'password': 'testpass1234',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', resp.data)

    def test_login_wrong_password(self):
        resp = self.client.post('/api/auth/login/', {
            'email': 'existing@example.com', 'password': 'wrongpass',
        })
        self.assertIn(resp.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_401_UNAUTHORIZED])

    def test_profile_get(self):
        token = self._get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.get('/api/auth/profile/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], 'existing@example.com')

    def test_profile_update(self):
        token = self._get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.patch('/api/auth/profile/', {'first_name': 'Updated'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['first_name'], 'Updated')

    def test_change_password(self):
        token = self._get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.put('/api/auth/change-password/', {
            'old_password': 'testpass1234',
            'new_password': 'newpass5678',
            'confirm_new_password': 'newpass5678',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
