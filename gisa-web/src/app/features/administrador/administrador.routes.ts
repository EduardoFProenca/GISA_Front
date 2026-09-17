import { Routes } from '@angular/router';
import { DashboardAdministrador } from './dashboard/dashboard'; // ajuste o nome se já renomeou pra DashboardAdministrador
import { CadastrarProfissional } from './cadastrar-profissional/cadastrar-profissional';

export const administradorRoutes: Routes = [
  { path: 'dashboard', component: DashboardAdministrador },
  { path: 'profissionais/novo', component: CadastrarProfissional },
];