from rest_framework import routers
from .views import EmpleadoViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register('empleados', EmpleadoViewSet, basename='empleados')

urlpatterns = [
    # Accept the URLs used by the frontend without redirecting write requests.
    path('empleados', EmpleadoViewSet.as_view({
        'get': 'list', 'post': 'create',
    })),
    path('empleados/<int:pk>', EmpleadoViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'patch': 'partial_update',
        'delete': 'destroy',
    })),
    path('', include(router.urls)),
]
