// Cargos e CBOs (ver CARGOS.md).
import { CadastroVinculado } from './comum.model';

// Item de GET /cargos e bloco `cargo` dos detalhes de profissional.
export interface Cargo {
  idCargo: number;
  nome: string;
  codigoCBO: string;
  tituloCBO: string;
}

// GET /cargos/{id}: inclui profissionais, especialistas e PJ (ativos e inativos).
export interface CargoDetalhe extends Cargo {
  profissionais: CadastroVinculado[];
}

export interface NovoCargoPayload {
  nome: string;
  codigoCBO: string;
}

export type AtualizacaoCargoPayload = Partial<NovoCargoPayload>;

export interface Cbo {
  codigoCBO: string;
  tituloCBO: string;
}

// GET /cbos/{codigo}
export interface CboDetalhe extends Cbo {
  cargos: { idCargo: number; nome: string }[];
}

// Corpo do POST /cbos (codigoCBO: 6 dígitos, sem máscara).
export type NovoCboPayload = Cbo;

export interface AtualizacaoCboPayload {
  tituloCBO: string;
}
