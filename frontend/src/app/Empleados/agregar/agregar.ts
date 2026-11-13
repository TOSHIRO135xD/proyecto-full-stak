import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NuevoEmpleado } from '../../models/empleado';
import { mensajeError } from '../api-error';
import { EmpleadoService } from '../empleado-service';

@Component({
  imports: [FormsModule, RouterModule],
  selector: 'app-agregar',
  templateUrl: './agregar.html',
})
export class Agregar {
  private empleadoService = inject(EmpleadoService);
  private router = inject(Router);

  empleado: NuevoEmpleado = {
    nombre: '',
    apellido: '',
    email: '',
    edad: 0,
    salario: 0,
    horas: 0,
  };

  guardando = signal(false);
  error = signal('');

  onSubmit(form: NgForm): void {
    if (this.guardando()) return;
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    this.empleadoService.createEmpleado(this.empleado).subscribe({
      next: () => {
        this.router.navigate(['/empleados']);
      },
      error: (error) => {
        this.guardando.set(false);
        this.error.set(mensajeError(error));
      },
    });
  }
}
