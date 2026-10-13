import { Routes } from '@angular/router';
import { exigePermissao } from '../../core/auth/auth-guard';
import { LayoutRecepcao } from './layout-recepcao/layout-recepcao';
import { DashboardRecepcao } from './dashboard/dashboard';
import { pacientesRoutes } from '../pacientes/pacientes.routes';
import { terapiasRoutes } from '../terapias/terapias.routes';
import { EmitirRecusa } from './emitir-recusa/emitir-recusa';
import { RegistrarPresenca } from '../terapias/registrar-presenca/registrar-presenca';

const presenca = exigePermissao('VISUALIZAR_TERAPIAS');

export const recepcaoRoutes: Routes = [
  {
    path: '',
    component: LayoutRecepcao,
    children: [
      { path: '', component: DashboardRecepcao },
      { path: 'pacientes', children: pacientesRoutes('/recepcao/pacientes') },
      { path: 'terapias', children: terapiasRoutes('/recepcao/terapias', 'Controle de Agendamentos') },
      {
        path: 'presenca',
        component: RegistrarPresenca,
        canActivate: presenca.canActivate,
        data: { ...presenca.data, modo: 'geral', rotaTerapias: '/recepcao/terapias' },
      },
      { path: 'recusa', component: EmitirRecusa, ...exigePermissao('EMITIR_RECUSA') },
    ],
  },
];
