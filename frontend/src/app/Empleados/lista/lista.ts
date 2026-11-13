import { Component, inject, signal } from '@angular/core';
import { EmpleadoService } from '../empleado-service';
import { Empleado } from '../../models/empleado';
import { RouterLink } from '@angular/router';
import { mensajeError } from '../api-error';

@Component({
  imports: [RouterLink],
  selector: 'app-lista',

  templateUrl: './lista.html',
})
export class ListaComponent {
  empleados = signal<Empleado[]>([]);
  cargando = signal(false);
  error = signal('');
  eliminando = signal<number | null>(null);

  private empleadoService = inject(EmpleadoService);
  
  constructor() {
    this.cargar();
  }
  cargar() {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set('');
    this.empleadoService.getEmpleados().subscribe({
      next: (data) => {
        this.empleados.set(data);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeError(error));
        this.cargando.set(false);
      },
    });
  }

  eliminar(id: number) {
    if (this.eliminando() !== null || this.cargando()) return;
    const empleado = this.empleados().find(empleado => empleado.id === id);
    if (!confirm(`¿Estás seguro de eliminar a ${empleado?.nombre ?? id}?`)) return;

    this.eliminando.set(id);
    this.error.set('');
    this.empleadoService.deleteEmpleado(id).subscribe({
      next: () => {
        this.empleados.update(empleados => empleados.filter(empleado => empleado.id !== id));
        this.eliminando.set(null);
      },
      error: (error) => {
        this.error.set(mensajeError(error));
        this.eliminando.set(null);
      },
    });
  }
}
