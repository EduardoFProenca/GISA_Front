import { Routes } from '@angular/router';
import { AlterarSenha } from '../conta/alterar-senha/alterar-senha';
import { LayoutPainel } from '../../core/layout/layout-painel/layout-painel';
import { exigePermissao, permissaoGuard } from '../../core/auth/auth-guard';
import { DetalheTerapia } from '../terapias/detalhe-terapia/detalhe-terapia';
import { DashboardEspecialista } from './dashboard/dashboard';
import { AgendaEspecialista } from './agenda/agenda-especialista';
import { AtendimentoEspecialista } from './atendimento/atendimento';
import { EmitirDocumento } from './emitir-documento/emitir-documento';
import { RegistrarPresenca } from '../terapias/registrar-presenca/registrar-presenca';

const telas: Routes = [
  { path: '', component: DashboardEspecialista },
  { path: 'minha-senha', component: AlterarSenha },
  // Agenda, terapias do dia e detalhe usam /terapias/minhas e /terapias/{id}: basta ser especialista
  // participante (o especialista não tem VISUALIZAR_TERAPIAS).
  { path: 'agenda', component: AgendaEspecialista },
  // Atestado e receita: escolhe o paciente e abre o mesmo drawer do prontuário.
  { path: 'atestado', component: EmitirDocumento, canActivate: [permissaoGuard], data: { funcionalidades: ['EMITIR_ATESTADO'], tipo: 'ATESTADO' } },
  { path: 'receita', component: EmitirDocumento, canActivate: [permissaoGuard], data: { funcionalidades: ['EMITIR_RECEITA'], tipo: 'RECEITA' } },
  // Prontuário / atendimento do paciente. O atestado abre em drawer dentro desta tela.
  { path: 'atendimento/:idPaciente', component: AtendimentoEspecialista, ...exigePermissao('VISUALIZAR_PACIENTES') },
  {
    path: 'minhas-terapias',
    component: RegistrarPresenca,
    data: { modo: 'minhas', rotaTerapias: '/especialista/terapias' },
  },
  // Só o detalhe: "Voltar para a lista" leva às terapias do dia.
  {
    path: 'terapias/:id',
    component: DetalheTerapia,
    data: { rotaBaseTerapias: '/especialista/minhas-terapias', tituloTerapias: 'Minhas Terapias do Dia' },
  },
];

// Todas as telas do painel ficam dentro do layout com o menu lateral.
export const especialistaRoutes: Routes = [
  { path: '', component: LayoutPainel, data: { painel: 'ESPECIALISTA' }, children: telas },
];
