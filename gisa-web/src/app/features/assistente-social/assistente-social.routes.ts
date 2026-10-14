import { Routes } from '@angular/router';
import { LayoutPainel } from '../../core/layout/layout-painel/layout-painel';
import { DashboardAssistenteSocial } from './dashboard/dashboard';
import { pacientesRoutes } from '../pacientes/pacientes.routes';

// O Assistente Social não tem telas próprias: usa as de pacientes em modo somente leitura.
const telas: Routes = [
  { path: '', component: DashboardAssistenteSocial },
  { path: 'pacientes', children: pacientesRoutes('/assistente-social/pacientes', true) },
];

// Todas as telas do painel ficam dentro do layout com o menu lateral.
export const assistenteSocialRoutes: Routes = [
  { path: '', component: LayoutPainel, data: { painel: 'ASSISTENTE_SOCIAL' }, children: telas },
];
