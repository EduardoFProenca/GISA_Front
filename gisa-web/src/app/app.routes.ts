import { Routes } from '@angular/router';
import { DashboardAdministrador } from './features/administrador/dashboard/dashboard';
import { CadastroProfissional } from './features/administrador/cadastrar-profissional/cadastrar-profissional';

export const routes: Routes = [
  { path: '', component: DashboardAdministrador }, // tela inicial
  { path: 'administrador/profissionais/novo', component: CadastroProfissional },
];