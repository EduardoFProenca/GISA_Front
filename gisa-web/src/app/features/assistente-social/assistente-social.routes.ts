import { Routes } from '@angular/router';
import { DashboardAssistenteSocial } from './dashboard/dashboard';
import { pacientesRoutes } from '../pacientes/pacientes.routes';

// O Assistente Social não tem telas próprias: usa as de pacientes em modo somente leitura.
export const assistenteSocialRoutes: Routes = [
  { path: '', component: DashboardAssistenteSocial },
  { path: 'pacientes', children: pacientesRoutes('/assistente-social/pacientes', true) },
];
