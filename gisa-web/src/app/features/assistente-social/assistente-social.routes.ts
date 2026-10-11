import { Routes } from '@angular/router';
import { DashboardAssistenteSocial } from './dashboard/dashboard';
import { GerenciarPacientes } from '../administrador/gerenciar-pacientes/gerenciar-pacientes';
import { DetalhePaciente } from '../administrador/detalhe-paciente/detalhe-paciente';

// O Assistente Social não tem telas próprias: usa as de pacientes em modo somente leitura.
const PERFIL_LEITURA = {
  somenteLeitura: true,
  rotaBasePacientes: '/assistente-social/pacientes',
};

export const assistenteSocialRoutes: Routes = [
  { path: '', component: DashboardAssistenteSocial },
  { path: 'pacientes', component: GerenciarPacientes, data: PERFIL_LEITURA },
  { path: 'pacientes/:id', component: DetalhePaciente, data: PERFIL_LEITURA },
];
