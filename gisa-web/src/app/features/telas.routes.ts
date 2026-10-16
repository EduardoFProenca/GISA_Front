import { CanActivateFn, Routes } from '@angular/router';
import { exigeCadastro, exigePermissao } from '../core/auth/auth-guard';
import { LayoutSistema } from '../core/layout/layout-sistema/layout-sistema';
import { Inicio } from './inicio/inicio';
import { AlterarSenha } from './conta/alterar-senha/alterar-senha';
import { pacientesRoutes } from './pacientes/pacientes.routes';
import { terapiasRoutes } from './terapias/terapias.routes';
import { RegistrarPresenca } from './terapias/registrar-presenca/registrar-presenca';
import { DetalheTerapia } from './terapias/detalhe-terapia/detalhe-terapia';
import { FormTerapia } from './terapias/form-terapia/form-terapia';
import { EmitirRecusa } from './documentos/emitir-recusa/emitir-recusa';
import { AgendaEspecialista } from './especialista/agenda/agenda-especialista';
import { AtendimentoEspecialista } from './especialista/atendimento/atendimento';
import { EmitirDocumento } from './especialista/emitir-documento/emitir-documento';
import { CadastroProfissional } from './administrador/cadastrar-profissional/cadastrar-profissional';
import { GerenciarProfissionais } from './administrador/gerenciar-profissionais/gerenciar-profissionais';
import { DetalheProfissional } from './administrador/detalhe-profissional/detalhe-profissional';
import { EditarProfissional } from './administrador/editar-profissional/editar-profissional';
import { HistoricoProfissional } from './administrador/historico-profissional/historico-profissional';
import { GerenciarCargos } from './administrador/cargos/gerenciar-cargos/gerenciar-cargos';
import { DetalheCargo } from './administrador/cargos/detalhe-cargo/detalhe-cargo';
import { GerenciarCbos } from './administrador/cbos/gerenciar-cbos/gerenciar-cbos';
import { DetalheCbo } from './administrador/cbos/detalhe-cbo/detalhe-cbo';
import { GerenciarPerfis } from './administrador/perfis/gerenciar-perfis/gerenciar-perfis';
import { DetalhePerfil } from './administrador/perfis/detalhe-perfil/detalhe-perfil';
import { GerenciarEspecialidades } from './administrador/especialidades/gerenciar-especialidades/gerenciar-especialidades';
import { DetalheEspecialidade } from './administrador/especialidades/detalhe-especialidade/detalhe-especialidade';
import { GerenciarEscolas } from './administrador/escolas/gerenciar-escolas/gerenciar-escolas';
import { DetalheEscola } from './administrador/escolas/detalhe-escola/detalhe-escola';
import { GerenciarUsuarios } from './administrador/usuarios/gerenciar-usuarios/gerenciar-usuarios';
import { DetalheUsuario } from './administrador/usuarios/detalhe-usuario/detalhe-usuario';
import { Auditoria } from './administrador/auditoria/auditoria';

// Todas as telas do sistema, na raiz (/pacientes, /cargos, /agenda...). Não há painéis por perfil:
// cada tela abre para quem tem a permissão dela (ou o tipo de cadastro, nas telas "minhas"),
// qualquer que seja o nome do perfil. O menu e o Gestão Rápida seguem o mesmo catálogo
// (core/layout/menus.ts): ao criar uma tela, cadastre-a nos dois lugares.
const minhasTerapias = { rotaBaseTerapias: '/minhas-terapias', tituloTerapias: 'Minhas Terapias do Dia' };

// Controle de acesso (exigePermissao/exigeCadastro) mais dados próprios da rota.
function comDados(acesso: { canActivate: CanActivateFn[]; data: object }, data: object) {
  return { canActivate: acesso.canActivate, data: { ...acesso.data, ...data } };
}

const telas: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Inicio },
  { path: 'minha-senha', component: AlterarSenha },

  // Pacientes e terapias
  { path: 'pacientes', children: pacientesRoutes('/pacientes') },
  { path: 'terapias', children: terapiasRoutes('/terapias', 'Controle de Agendamentos') },
  {
    path: 'presenca',
    component: RegistrarPresenca,
    ...comDados(exigePermissao('VISUALIZAR_TERAPIAS'), { modo: 'geral', rotaTerapias: '/terapias' }),
  },
  // Prontuário do paciente. O especialista vê as terapias dele com o paciente; quem tem
  // VISUALIZAR_TERAPIAS vê todas. Atestado e receita abrem em drawer dentro desta tela.
  { path: 'atendimento/:idPaciente', component: AtendimentoEspecialista, ...exigePermissao('VISUALIZAR_PACIENTES') },

  // Meus atendimentos: usam /terapias/minhas e /terapias/{id}, que a API atende para o especialista
  // participante (sem VISUALIZAR_TERAPIAS). Exigem cadastro de especialista, não uma permissão.
  { path: 'agenda', component: AgendaEspecialista, ...exigeCadastro('ESPECIALISTA') },
  {
    path: 'minhas-terapias',
    component: RegistrarPresenca,
    ...comDados(exigeCadastro('ESPECIALISTA'), { modo: 'minhas', rotaTerapias: '/minhas-terapias' }),
  },
  // Detalhe de uma terapia própria ("Voltar para a lista" leva às terapias do dia).
  { path: 'minhas-terapias/:id', component: DetalheTerapia, ...comDados(exigeCadastro('ESPECIALISTA'), minhasTerapias) },
  {
    path: 'minhas-terapias/:id/editar',
    component: FormTerapia,
    ...comDados(exigeCadastro('ESPECIALISTA', 'EDITAR_TERAPIA'), minhasTerapias),
  },

  // Documentos. Atestado e receita usam o cadastro de quem emite (registro no conselho, especialidade
  // e CBO, de /especialistas/me): exigem a permissão e cadastro de especialista.
  { path: 'atestado', component: EmitirDocumento, ...comDados(exigeCadastro('ESPECIALISTA', 'EMITIR_ATESTADO'), { tipo: 'ATESTADO' }) },
  { path: 'receita', component: EmitirDocumento, ...comDados(exigeCadastro('ESPECIALISTA', 'EMITIR_RECEITA'), { tipo: 'RECEITA' }) },
  { path: 'recusa', component: EmitirRecusa, ...exigePermissao('EMITIR_RECUSA') },

  // Equipe
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
];

// Todas as telas ficam dentro do layout com o menu lateral.
export const telasRoutes: Routes = [{ path: '', component: LayoutSistema, children: telas }];
