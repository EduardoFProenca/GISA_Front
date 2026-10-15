// Autenticação, senha e usuários de acesso (ver 00-GERAL.md e USUARIOS.md).
import { ParametrosPagina, StatusCadastro } from './comum.model';
import { PerfilResumo, Permissao } from './perfil.model';

export interface LoginRequest {
  email: string;
  senha: string;
}

// POST /auth/login. Login normal: token. Primeiro acesso (senha temporária): sem token, com
// tokenRedefinicao (60 min) para cadastrar a senha definitiva em POST /auth/redefinir-senha.
export interface LoginResponse {
  token?: string;
  senhaTemporaria: boolean;
  tokenRedefinicao?: string;
}

// Resposta da troca da própria senha e da redefinição (o token novo substitui o salvo).
export interface TokenResponse {
  token: string;
}

// POST /auth/redefinir-senha: primeiro acesso (tokenRedefinicao do login) ou "esqueci minha senha" (token do link).
export interface RedefinirSenhaPayload {
  token: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
}

// PESSOA = cadastro sem vínculo de profissional (ex.: o administrador inicial).
export type TipoCadastro = 'PESSOA' | 'PROFISSIONAL' | 'ESPECIALISTA' | 'ESPECIALISTA_PJ' | 'ASSISTENTE_SOCIAL';

// GET /usuarios/me (permissões ordenadas por ID). email é o login.
export interface UsuarioLogado {
  idCadastro: number;
  nome: string;
  cpf: string;
  email: string;
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

// GET /usuarios/{idCadastro} e resposta do PATCH de perfil. cargo é null para PESSOA.
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
