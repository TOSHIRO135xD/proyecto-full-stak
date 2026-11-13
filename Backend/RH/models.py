from django.db import models
from django.core.validators import MinValueValidator

class Empleado(models.Model):
    nombre = models.CharField(max_length=150)
    apellido = models.CharField(max_length=150)
    email = models.EmailField()
    edad = models.PositiveIntegerField()
    salario = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    horas = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
