// Autenticação, senha e usuários de acesso (ver 00-GERAL.md e USUARIOS.md).
import { ParametrosPagina, StatusCadastro } from './comum.model';
import { PerfilResumo, Permissao } from './perfil.model';

export interface LoginRequest {
  cpf: string;
  senha: string;
}

// Resposta do login e da troca da própria senha (o token novo substitui o salvo).
export interface LoginResponse {
  token: string;
  [key: string]: any;
}

// PESSOA = cadastro sem vínculo de profissional (ex.: o administrador inicial).
export type TipoCadastro = 'PESSOA' | 'PROFISSIONAL' | 'ESPECIALISTA' | 'ESPECIALISTA_PJ';

// GET /usuarios/me (permissões ordenadas por ID).
export interface UsuarioLogado {
  idCadastro: number;
  nome: string;
  cpf: string;
  tipoCadastro: TipoCadastro;
  perfil: PerfilResumo;
  permissoes: Permissao[];
}

// PATCH /usuarios/minha-senha (devolve um token novo).
export interface AlterarMinhaSenhaPayload {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
}

// PATCH /usuarios/{idCadastro}/senha (administrador; 204).
export interface RedefinirSenhaPayload {
  novaSenha: string;
}

// ---------- Usuários do sistema (GERENCIAR_USUARIOS) ----------

// Item de GET /usuarios (só cadastros com usuário de acesso).
export interface UsuarioResumo {
  idCadastro: number;
  nome: string;
  cpf: string;
  tipoCadastro: TipoCadastro;
  perfil: PerfilResumo;
  statusCadastro: StatusCadastro;
}

// GET /usuarios/{idCadastro} e resposta do PATCH de perfil. email e cargo são null para PESSOA.
export interface UsuarioDetalhe extends UsuarioResumo {
  email: string | null;
  cargo: { idCargo: number; nome: string } | null;
  permissoes: Permissao[];
}

export interface FiltroUsuarios extends ParametrosPagina {
  cpf?: string;
  nome?: string;
  idPerfil?: number;
  tipoCadastro?: TipoCadastro[];
  statusCadastro?: StatusCadastro;
}
