import { Routes } from '@angular/router';
import { exigePermissao } from '../../core/auth/auth-guard';
import { DashboardAdministrador } from './dashboard/dashboard';
import { CadastroProfissional } from './cadastrar-profissional/cadastrar-profissional';
import { GerenciarProfissionais } from './gerenciar-profissionais/gerenciar-profissionais';
import { DetalheProfissional } from './detalhe-profissional/detalhe-profissional';
import { EditarProfissional } from './editar-profissional/editar-profissional';
import { CriarConsulta } from '../terapias/criar-consulta/criar-consulta';
import { HistoricoProfissional } from './historico-profissional/historico-profissional';
import { GerenciarConsultas } from '../terapias/gerenciar-consultas/gerenciar-consultas';
import { pacientesRoutes } from '../pacientes/pacientes.routes';

export const administradorRoutes: Routes = [
  { path: '', component: DashboardAdministrador },
  { path: 'profissionais/novo', component: CadastroProfissional },
  { path: 'profissionais/gerenciar', component: GerenciarProfissionais },
  { path: 'profissionais/:id', component: DetalheProfissional },
  { path: 'profissionais/:id/editar', component: EditarProfissional, ...exigePermissao('EDITAR_PROFISSIONAL') },
  { path: 'consultas/nova', component: CriarConsulta, ...exigePermissao('AGENDAR_TERAPIA') },
  { path: 'profissionais/:id/historico', component: HistoricoProfissional },

  { path: 'pacientes', children: pacientesRoutes('/administrador/pacientes') },

  { path: 'consultas/gerenciar', component: GerenciarConsultas, ...exigePermissao('VISUALIZAR_TERAPIAS') },
];