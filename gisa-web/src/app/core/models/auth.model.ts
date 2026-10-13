// Autenticação e senha (ver 00-GERAL.md e USUARIOS.md).
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

export type TipoCadastro = 'PROFISSIONAL' | 'ESPECIALISTA' | 'ESPECIALISTA_PJ';

// GET /usuarios/me. ATENÇÃO: rota pedida ao back, ainda não existe.
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
