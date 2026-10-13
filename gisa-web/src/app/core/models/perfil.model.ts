// Perfis de acesso e permissões (ver PERFIS.md).
import { CadastroVinculado } from './comum.model';

export interface Permissao {
  idPermissao: number;
  nome: string;
  descricao: string;
}

// Referência a um perfil (bloco `perfil` do usuário de acesso).
export interface PerfilResumo {
  idPerfil: number;
  nome: string;
}

// Item de GET /perfis.
export interface Perfil extends PerfilResumo {
  quantidadePermissoes: number;
  quantidadeUsuarios: number;
}

// GET /perfis/{id} e resposta das rotas que alteram o perfil.
export interface PerfilDetalhe extends PerfilResumo {
  permissoes: Permissao[];
  usuarios: CadastroVinculado[];
}

export interface NovoPerfilPayload {
  nome: string;
  permissoesIds?: number[];
}

// permissoesIds substitui todas as permissões do perfil.
export type AtualizacaoPerfilPayload = Partial<NovoPerfilPayload>;

// POST /perfis/{id}/permissoes
export interface AdicionarPermissoesPayload {
  permissoesIds: number[];
}
