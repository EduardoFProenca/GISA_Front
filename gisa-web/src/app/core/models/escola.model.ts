import { TipoEscola } from './paciente.model';

export interface EscolaCadastrada {
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
