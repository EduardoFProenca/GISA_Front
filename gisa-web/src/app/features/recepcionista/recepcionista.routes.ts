import { Routes } from '@angular/router';
import { DashboardRecepcionista } from './dashboard/dashboard';
import { RegistrarPresenca } from './registrar-presenca/registrar-presenca';

export const recepcionistaRoutes: Routes = [
  { path: '', component: DashboardRecepcionista },
  { path: 'presenca', component: RegistrarPresenca },
];