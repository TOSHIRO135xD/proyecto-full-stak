import { Routes } from '@angular/router';
import { ListaComponent } from './Empleados/lista/lista';
import {Agregar} from './Empleados/agregar/agregar';
import { Actualizar } from './Empleados/actualizar/actualizar';

export const routes: Routes = [

    { path: 'empleados', component: ListaComponent},
    {path:'', redirectTo:'empleados', pathMatch:'full'},
    {path: 'agregar', component: Agregar},
    {path: 'actualizar/:id', component: Actualizar},
];

    
