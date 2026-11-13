from django.shortcuts import render
from rest_framework import viewsets,permissions
from .serializers import EmpleadoSerializer
from .models import Empleado

class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = EmpleadoSerializer
