// Escolas (ver ESCOLAS.md).
import { ParametrosPagina } from './comum.model';

export type TipoEscola = 'PUBLICA' | 'PARTICULAR';

// Item de GET /escolas/sugestoes e resposta do POST.
export interface Escola {
  idEscola: number;
  nome: string;
  tipoEscola: TipoEscola;
  telefone?: string | null;
}

// Item de GET /escolas (gestão) e de GET /escolas/{id}.
// quantidadePacientes conta ativos e inativos (os mesmos que impedem a exclusão).
export interface EscolaDetalhe extends Escola {
  quantidadePacientes: number;
}

export interface FiltroEscolas extends ParametrosPagina {
  nome?: string;
  tipoEscola?: TipoEscola;
}

export interface NovaEscolaPayload {
  nome: string;
  tipoEscola: TipoEscola;
  telefone?: string;
}

// PATCH /escolas/{id}: nome não vazio, tipoEscola não nulo, telefone null limpa.
export interface AtualizacaoEscolaPayload {
  nome?: string;
  tipoEscola?: TipoEscola;
  telefone?: string | null;
}
