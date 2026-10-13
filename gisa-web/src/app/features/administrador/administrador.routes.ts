import { Routes } from '@angular/router';
import { exigePermissao } from '../../core/auth/auth-guard';
import { DashboardAdministrador } from './dashboard/dashboard';
import { CadastroProfissional } from './cadastrar-profissional/cadastrar-profissional';
import { GerenciarProfissionais } from './gerenciar-profissionais/gerenciar-profissionais';
import { DetalheProfissional } from './detalhe-profissional/detalhe-profissional';
import { EditarProfissional } from './editar-profissional/editar-profissional';
import { HistoricoProfissional } from './historico-profissional/historico-profissional';
import { pacientesRoutes } from '../pacientes/pacientes.routes';
import { terapiasRoutes } from '../terapias/terapias.routes';

export const administradorRoutes: Routes = [
  { path: '', component: DashboardAdministrador },
  { path: 'profissionais/novo', component: CadastroProfissional },
  { path: 'profissionais/gerenciar', component: GerenciarProfissionais, ...exigePermissao('VISUALIZAR_PROFISSIONAIS') },
  { path: 'profissionais/:id', component: DetalheProfissional, ...exigePermissao('VISUALIZAR_PROFISSIONAIS') },
  { path: 'profissionais/:id/editar', component: EditarProfissional, ...exigePermissao('EDITAR_PROFISSIONAL') },
  { path: 'profissionais/:id/historico', component: HistoricoProfissional, ...exigePermissao('VISUALIZAR_TERAPIAS') },

  { path: 'pacientes', children: pacientesRoutes('/administrador/pacientes') },
  { path: 'terapias', children: terapiasRoutes('/administrador/terapias') },
];
