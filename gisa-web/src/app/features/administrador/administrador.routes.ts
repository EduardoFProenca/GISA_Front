import { Routes } from '@angular/router';
import { AlterarSenha } from '../conta/alterar-senha/alterar-senha';
import { LayoutPainel } from '../../core/layout/layout-painel/layout-painel';
import { exigePermissao } from '../../core/auth/auth-guard';
import { DashboardAdministrador } from './dashboard/dashboard';
import { CadastroProfissional } from './cadastrar-profissional/cadastrar-profissional';
import { GerenciarProfissionais } from './gerenciar-profissionais/gerenciar-profissionais';
import { DetalheProfissional } from './detalhe-profissional/detalhe-profissional';
import { EditarProfissional } from './editar-profissional/editar-profissional';
import { HistoricoProfissional } from './historico-profissional/historico-profissional';
import { GerenciarCargos } from './cargos/gerenciar-cargos/gerenciar-cargos';
import { DetalheCargo } from './cargos/detalhe-cargo/detalhe-cargo';
import { GerenciarCbos } from './cbos/gerenciar-cbos/gerenciar-cbos';
import { DetalheCbo } from './cbos/detalhe-cbo/detalhe-cbo';
import { GerenciarPerfis } from './perfis/gerenciar-perfis/gerenciar-perfis';
import { DetalhePerfil } from './perfis/detalhe-perfil/detalhe-perfil';
import { EmitirRecusa } from '../documentos/emitir-recusa/emitir-recusa';
import { Auditoria } from './auditoria/auditoria';
import { pacientesRoutes } from '../pacientes/pacientes.routes';
import { terapiasRoutes } from '../terapias/terapias.routes';

const telas: Routes = [
  { path: '', component: DashboardAdministrador },
  { path: 'minha-senha', component: AlterarSenha },
  { path: 'profissionais/novo', component: CadastroProfissional },
  { path: 'profissionais/gerenciar', component: GerenciarProfissionais, ...exigePermissao('VISUALIZAR_PROFISSIONAIS') },
  { path: 'profissionais/:id', component: DetalheProfissional, ...exigePermissao('VISUALIZAR_PROFISSIONAIS') },
  { path: 'profissionais/:id/editar', component: EditarProfissional, ...exigePermissao('EDITAR_PROFISSIONAL') },
  { path: 'profissionais/:id/historico', component: HistoricoProfissional, ...exigePermissao('VISUALIZAR_TERAPIAS') },

  // Tabelas de apoio (CARGOS.md e PERFIS.md)
  { path: 'cargos', component: GerenciarCargos, ...exigePermissao('GERENCIAR_CARGOS') },
  { path: 'cargos/:id', component: DetalheCargo, ...exigePermissao('GERENCIAR_CARGOS') },
  { path: 'cbos', component: GerenciarCbos, ...exigePermissao('GERENCIAR_CARGOS') },
  { path: 'cbos/:codigo', component: DetalheCbo, ...exigePermissao('GERENCIAR_CARGOS') },
  { path: 'perfis', component: GerenciarPerfis, ...exigePermissao('GERENCIAR_PERFIS') },
  { path: 'perfis/:id', component: DetalhePerfil, ...exigePermissao('GERENCIAR_PERFIS') },

  // Documentos: o admin emite só a recusa (atestado e receita são do especialista).
  { path: 'recusa', component: EmitirRecusa, ...exigePermissao('EMITIR_RECUSA') },

  // Segurança (AUDITORIA.md)
  { path: 'auditoria', component: Auditoria, ...exigePermissao('VISUALIZAR_AUDITORIA') },

  { path: 'pacientes', children: pacientesRoutes('/administrador/pacientes') },
  { path: 'terapias', children: terapiasRoutes('/administrador/terapias') },
];

// Todas as telas do painel ficam dentro do layout com o menu lateral.
export const administradorRoutes: Routes = [
  { path: '', component: LayoutPainel, data: { painel: 'ADMINISTRADOR' }, children: telas },
];
