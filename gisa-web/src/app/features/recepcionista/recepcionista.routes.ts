import { Routes } from '@angular/router';
import { LayoutRecepcionista } from './layout-recepcionista/layout-recepcionista';
import { DashboardRecepcionista } from './dashboard/dashboard';
import { GerenciarPaciente } from './gerenciar-paciente/gerenciar-paciente';
import { EmitirRecusa } from './emitir-recusa/emitir-recusa';
import { RegistrarPresenca } from './registrar-presenca/registrar-presenca';
import { ControleAgendamentos } from './controle-agendamentos/controle-agendamentos';

export const recepcionistaRoutes: Routes = [
  {
    path: '',
    component: LayoutRecepcionista,
    children: [
      { path: '', component: DashboardRecepcionista },
      { path: 'pacientes', component: GerenciarPaciente },
      { path: 'recusa', component: EmitirRecusa },
      { path: 'presenca', component: RegistrarPresenca },
      { path: 'agendamentos', component: ControleAgendamentos },
    ],
  },
];