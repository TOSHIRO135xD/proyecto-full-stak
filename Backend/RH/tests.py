from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Empleado


class EmpleadoAPITests(APITestCase):
    def setUp(self):
        self.payload = {
            'nombre': 'Ana', 'apellido': 'Perez', 'edad': 30,
            'salario': '2500.50', 'horas': 40,
            'email': 'ana@example.com',
        }

    def test_crud_with_and_without_trailing_slash(self):
        for suffix in ('/', ''):
            with self.subTest(suffix=suffix):
                url = '/api/empleados' + suffix
                response = self.client.post(url, self.payload, format='json')
                self.assertEqual(response.status_code, 201, response.data)
                pk = response.data['id']
                detail = f'/api/empleados/{pk}{suffix}'
                response = self.client.get(url)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(len(response.data), 1)
                self.assertEqual(response.data[0]['email'], self.payload['email'])
                self.assertEqual(Empleado.objects.get(pk=pk).email, self.payload['email'])
                self.assertEqual(self.client.get(detail).data['nombre'], 'Ana')
                updated = {**self.payload, 'nombre': 'Maria'}
                response = self.client.put(detail, updated, format='json')
                self.assertEqual(response.status_code, 200, response.data)
                response = self.client.patch(detail, {'horas': 35}, format='json')
                self.assertEqual(response.status_code, 200, response.data)
                employee = Empleado.objects.get(pk=pk)
                self.assertEqual(employee.nombre, 'Maria')
                self.assertEqual(employee.horas, 35)
                self.assertEqual(self.client.delete(detail).status_code, 204)
                self.assertFalse(Empleado.objects.filter(pk=pk).exists())
                self.assertEqual(self.client.get(detail).status_code, 404)

    def test_invalid_employee_is_rejected(self):
        url = reverse('empleados-list')
        self.assertEqual(self.client.post(url, {}, format='json').status_code, 400)
        for field in ('edad', 'salario', 'horas'):
            with self.subTest(field=field):
                response = self.client.post(
                    url, {**self.payload, field: -1}, format='json'
                )
                self.assertEqual(response.status_code, 400, response.data)
                self.assertIn(field, response.data)
        self.assertEqual(Empleado.objects.count(), 0)

    def test_email_required_and_valid_on_create_and_update(self):
        url = reverse('empleados-list')
        for value in (None, '', 'not-an-email'):
            payload = {**self.payload, 'email': value}
            response = self.client.post(url, payload, format='json')
            self.assertEqual(response.status_code, 400)
            self.assertIn('email', response.data)
        payload = {key: value for key, value in self.payload.items() if key != 'email'}
        self.assertEqual(self.client.post(url, payload, format='json').status_code, 400)
        employee = Empleado.objects.create(**self.payload)
        detail = reverse('empleados-detail', args=[employee.pk])
        self.assertEqual(self.client.put(detail, payload, format='json').status_code, 400)
        self.assertEqual(self.client.patch(detail, {'email': ''}, format='json').status_code, 400)
        response = self.client.patch(detail, {'email': 'nuevo@example.com'}, format='json')
        self.assertEqual(response.status_code, 200)
        employee.refresh_from_db()
        self.assertEqual(employee.email, 'nuevo@example.com')

    def test_router_root_and_names(self):
        response = self.client.get(reverse('api-root'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['empleados'].endswith('/api/empleados/'))
        self.assertEqual(reverse('empleados-detail', args=[1]), '/api/empleados/1/')

    def test_cors_preflight(self):
        for origin in ('http://localhost:4200', 'http://127.0.0.1:4200'):
            response = self.client.options(
                '/api/empleados', HTTP_ORIGIN=origin,
                HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
                HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type',
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response['Access-Control-Allow-Origin'], origin)
            self.assertIn('POST', response['Access-Control-Allow-Methods'])
        response = self.client.options(
            '/api/empleados', HTTP_ORIGIN='http://untrusted.example',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
        )
        self.assertNotIn('Access-Control-Allow-Origin', response)
