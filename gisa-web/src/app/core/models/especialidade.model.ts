// Especialidades (ver ESPECIALISTAS.md).
import { StatusCadastro } from './comum.model';

export interface Especialidade {
  idEspecialidade: number;
  nome: string;
  descricao: string | null;
  // Em GET /especialidades e no detalhe: especialistas e PJ, ativos e inativos (os que impedem a exclusão).
  quantidadeEspecialistas?: number;
}

export interface EspecialistaVinculado {
  idCadastro: number;
  nome: string;
  tipo: 'ESPECIALISTA' | 'ESPECIALISTA_PJ';
  statusCadastro: StatusCadastro;
}

// GET /especialidades/{id} e resposta do PATCH.
export interface EspecialidadeDetalhe extends Especialidade {
  quantidadeEspecialistas: number;
  especialistas: EspecialistaVinculado[];
}

// Corpo do POST /especialidades e item de `novasEspecialidades` no cadastro de especialista.
export interface NovaEspecialidade {
  nome: string;
  descricao?: string;
}

// PATCH: nome não vazio; descricao null limpa.
export interface AtualizacaoEspecialidadePayload {
  nome?: string;
  descricao?: string | null;
}
