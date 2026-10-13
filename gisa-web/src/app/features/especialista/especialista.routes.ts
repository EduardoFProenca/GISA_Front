import { Routes } from '@angular/router';
import { exigePermissao } from '../../core/auth/auth-guard';
import { DashboardEspecialista } from './dashboard/dashboard';
import { AgendaEspecialista } from './agenda/agenda-especialista';
import { AtendimentoEspecialista } from './atendimento/atendimento';
import { RegistrarPresenca } from '../terapias/registrar-presenca/registrar-presenca';
import { terapiasRoutes } from '../terapias/terapias.routes';

const minhas = exigePermissao('VISUALIZAR_TERAPIAS');

export const especialistaRoutes: Routes = [
  { path: '', component: DashboardEspecialista },
  { path: 'agenda', component: AgendaEspecialista, ...minhas },
  // Prontuário / atendimento do paciente. O atestado abre em drawer dentro desta tela.
  { path: 'atendimento/:idPaciente', component: AtendimentoEspecialista, ...exigePermissao('VISUALIZAR_PACIENTES') },
  {
    path: 'minhas-terapias',
    component: RegistrarPresenca,
    canActivate: minhas.canActivate,
    data: { ...minhas.data, modo: 'minhas', rotaTerapias: '/especialista/terapias' },
  },
  { path: 'terapias', children: terapiasRoutes('/especialista/terapias', 'Terapias') },
];
