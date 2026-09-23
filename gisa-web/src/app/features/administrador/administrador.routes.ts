import { Routes } from '@angular/router';
import { DashboardAdministrador } from './dashboard/dashboard';
import { CadastroProfissional } from './cadastrar-profissional/cadastrar-profissional';
import { GerenciarProfissionais } from './gerenciar-profissionais/gerenciar-profissionais';
import { DetalheProfissional } from './detalhe-profissional/detalhe-profissional';
import { CadastrarPaciente } from './cadastrar-paciente/cadastrar-paciente';

export const administradorRoutes: Routes = [
  { path: '', component: DashboardAdministrador },
  { path: 'profissionais/novo', component: CadastroProfissional },
  { path: 'profissionais/gerenciar', component: GerenciarProfissionais },
  { path: 'profissionais/:id', component: DetalheProfissional },
  { path: 'profissionais/:id/editar', component: CadastroProfissional },
  { path: 'pacientes/novo', component: CadastrarPaciente },
];