import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Empleado } from '../../models/empleado';
import { EmpleadoService } from '../empleado-service';
import { mensajeError } from '../api-error';

@Component({
  selector: 'app-actualizar',
  imports: [FormsModule, RouterLink],
  templateUrl: './actualizar.html',
})
export class Actualizar implements OnInit {
  private empleadoService = inject(EmpleadoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  empleado: Empleado = {
    id: 0, nombre: '', apellido: '', email: '', edad: 0, salario: 0, horas: 0,
  };
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('El empleado no es válido.');
      this.cargando.set(false);
      return;
    }
    this.empleadoService.getEmpleado(id).subscribe({
      next: (empleado) => {
        this.empleado = empleado;
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeError(error));
        this.cargando.set(false);
      },
    });
  }

  onSubmit(form: NgForm): void {
    if (this.cargando() || this.guardando() || !this.empleado.id) return;
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.empleadoService.updateEmpleado(this.empleado.id, this.empleado).subscribe({
      next: () => this.router.navigate(['/empleados']),
      error: (error) => {
        this.error.set(mensajeError(error));
        this.guardando.set(false);
      },
    });
  }
}
