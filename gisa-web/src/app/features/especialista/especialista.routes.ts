import { Routes } from '@angular/router';
import { LayoutPainel } from '../../core/layout/layout-painel/layout-painel';
import { exigePermissao, permissaoGuard } from '../../core/auth/auth-guard';
import { DashboardEspecialista } from './dashboard/dashboard';
import { AgendaEspecialista } from './agenda/agenda-especialista';
import { AtendimentoEspecialista } from './atendimento/atendimento';
import { EmitirDocumento } from './emitir-documento/emitir-documento';
import { RegistrarPresenca } from '../terapias/registrar-presenca/registrar-presenca';
import { terapiasRoutes } from '../terapias/terapias.routes';

const minhas = exigePermissao('VISUALIZAR_TERAPIAS');

const telas: Routes = [
  { path: '', component: DashboardEspecialista },
  { path: 'agenda', component: AgendaEspecialista, ...minhas },
  // Atestado e receita: escolhe o paciente e abre o mesmo drawer do prontuário.
  { path: 'atestado', component: EmitirDocumento, canActivate: [permissaoGuard], data: { funcionalidade: 'EMITIR_ATESTADO', tipo: 'ATESTADO' } },
  { path: 'receita', component: EmitirDocumento, canActivate: [permissaoGuard], data: { funcionalidade: 'EMITIR_RECEITA', tipo: 'RECEITA' } },
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

// Todas as telas do painel ficam dentro do layout com o menu lateral.
export const especialistaRoutes: Routes = [
  { path: '', component: LayoutPainel, data: { painel: 'ESPECIALISTA' }, children: telas },
];
