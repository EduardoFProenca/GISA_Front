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
import { Auditoria } from './auditoria/auditoria';
import { GerenciarUsuarios } from './usuarios/gerenciar-usuarios/gerenciar-usuarios';
import { DetalheUsuario } from './usuarios/detalhe-usuario/detalhe-usuario';
import { GerenciarEscolas } from './escolas/gerenciar-escolas/gerenciar-escolas';
import { DetalheEscola } from './escolas/detalhe-escola/detalhe-escola';
import { GerenciarEspecialidades } from './especialidades/gerenciar-especialidades/gerenciar-especialidades';
import { DetalheEspecialidade } from './especialidades/detalhe-especialidade/detalhe-especialidade';
import { telasComunsRoutes } from '../telas-comuns.routes';

const telas: Routes = [
  { path: '', component: DashboardAdministrador },
  { path: 'minha-senha', component: AlterarSenha },
  {
    path: 'profissionais/novo',
    component: CadastroProfissional,
    ...exigePermissao('CADASTRAR_PROFISSIONAL', 'CADASTRAR_ESPECIALISTA', 'CADASTRAR_ESPECIALISTA_PJ'),
  },
  { path: 'profissionais/gerenciar', component: GerenciarProfissionais, ...exigePermissao('VISUALIZAR_PROFISSIONAIS') },
  { path: 'profissionais/:id', component: DetalheProfissional, ...exigePermissao('VISUALIZAR_PROFISSIONAIS') },
  { path: 'profissionais/:id/editar', component: EditarProfissional, ...exigePermissao('EDITAR_PROFISSIONAL') },
  { path: 'profissionais/:id/historico', component: HistoricoProfissional, ...exigePermissao('VISUALIZAR_TERAPIAS') },

  // Tabelas de apoio (CARGOS.md, PERFIS.md, ESPECIALISTAS.md e ESCOLAS.md)
  { path: 'cargos', component: GerenciarCargos, ...exigePermissao('GERENCIAR_CARGOS') },
  { path: 'cargos/:id', component: DetalheCargo, ...exigePermissao('GERENCIAR_CARGOS') },
  { path: 'cbos', component: GerenciarCbos, ...exigePermissao('GERENCIAR_CARGOS') },
  { path: 'cbos/:codigo', component: DetalheCbo, ...exigePermissao('GERENCIAR_CARGOS') },
  { path: 'perfis', component: GerenciarPerfis, ...exigePermissao('GERENCIAR_PERFIS') },
  { path: 'perfis/:id', component: DetalhePerfil, ...exigePermissao('GERENCIAR_PERFIS') },
  { path: 'especialidades', component: GerenciarEspecialidades, ...exigePermissao('GERENCIAR_ESPECIALIDADES') },
  { path: 'especialidades/:id', component: DetalheEspecialidade, ...exigePermissao('GERENCIAR_ESPECIALIDADES') },
  { path: 'escolas', component: GerenciarEscolas, ...exigePermissao('GERENCIAR_ESCOLAS') },
  { path: 'escolas/:id', component: DetalheEscola, ...exigePermissao('GERENCIAR_ESCOLAS') },

  // Segurança (USUARIOS.md e AUDITORIA.md)
  { path: 'usuarios', component: GerenciarUsuarios, ...exigePermissao('GERENCIAR_USUARIOS') },
  { path: 'usuarios/:id', component: DetalheUsuario, ...exigePermissao('GERENCIAR_USUARIOS') },
  { path: 'auditoria', component: Auditoria, ...exigePermissao('VISUALIZAR_AUDITORIA') },

  // Pacientes, terapias e recusa, conforme as permissões do perfil.
  ...telasComunsRoutes('ADMINISTRADOR'),
];

// Todas as telas do painel ficam dentro do layout com o menu lateral.
export const administradorRoutes: Routes = [
  { path: '', component: LayoutPainel, data: { painel: 'ADMINISTRADOR' }, children: telas },
];
