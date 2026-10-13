// Escolas (ver ESCOLAS.md).

export type TipoEscola = 'PUBLICA' | 'PARTICULAR';

export interface Escola {
  idEscola: number;
  nome: string;
  tipoEscola: TipoEscola;
  telefone?: string | null;
}

export interface NovaEscolaPayload {
  nome: string;
  tipoEscola: TipoEscola;
  telefone?: string;
}
