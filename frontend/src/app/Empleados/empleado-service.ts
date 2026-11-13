import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Empleado, NuevoEmpleado} from '../models/empleado';
import { Observable, timeout } from 'rxjs';





@Injectable({ providedIn: 'root' })
export class EmpleadoService {
    private httpCliente = inject(HttpClient);
    private baseUrl = 'http://localhost:8000/api/empleados';

    getEmpleados(): Observable<Empleado[]> {
    return this.httpCliente.get<Empleado[]>(`${this.baseUrl}/`).pipe(timeout(15000));
}

    getEmpleado(id: number): Observable<Empleado> {
    return this.httpCliente.get<Empleado>(`${this.baseUrl}/${id}/`).pipe(timeout(15000));
}

    createEmpleado(empleado: NuevoEmpleado): Observable<Empleado> {
    return this.httpCliente.post<Empleado>(`${this.baseUrl}/`, empleado).pipe(timeout(15000));
}

    updateEmpleado(id: number, empleado: Empleado): Observable<Empleado> {
    return this.httpCliente.put<Empleado>(`${this.baseUrl}/${id}/`, empleado).pipe(timeout(15000));
}

    deleteEmpleado(id: number): Observable<void> {
    return this.httpCliente.delete<void>(`${this.baseUrl}/${id}/`).pipe(timeout(15000));
}
}

