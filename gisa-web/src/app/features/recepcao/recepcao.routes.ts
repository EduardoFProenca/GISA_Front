import { Routes } from '@angular/router';
import { exigePermissao } from '../../core/auth/auth-guard';
import { LayoutRecepcao } from './layout-recepcao/layout-recepcao';
import { DashboardRecepcao } from './dashboard/dashboard';
import { pacientesRoutes } from '../pacientes/pacientes.routes';
import { EmitirRecusa } from './emitir-recusa/emitir-recusa';
import { RegistrarPresenca } from './registrar-presenca/registrar-presenca';
import { ControleAgendamentos } from './controle-agendamentos/controle-agendamentos';

export const recepcaoRoutes: Routes = [
  {
    path: '',
    component: LayoutRecepcao,
    children: [
      { path: '', component: DashboardRecepcao },
      { path: 'pacientes', children: pacientesRoutes('/recepcao/pacientes') },
      { path: 'recusa', component: EmitirRecusa, ...exigePermissao('EMITIR_RECUSA') },
      { path: 'presenca', component: RegistrarPresenca, ...exigePermissao('REGISTRAR_PRESENCA') },
      { path: 'agendamentos', component: ControleAgendamentos, ...exigePermissao('VISUALIZAR_TERAPIAS') },
    ],
  },
];