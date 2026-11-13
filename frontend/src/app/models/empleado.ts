export interface Empleado {
        id: number;
        nombre: string;
        apellido: string;
        email: string;
        edad: number;
        salario: number | string;
        horas: number;
}

export type NuevoEmpleado = Omit<Empleado, 'id'>;
