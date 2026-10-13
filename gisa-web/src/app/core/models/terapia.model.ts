// Terapias (ver TERAPIAS.md). "Consulta" nas telas = Terapia na API.
import { ParametrosPagina } from './comum.model';

// Calculada pelo back: 1 paciente = INDIVIDUAL; mais de um = COLETIVA.
export type Modalidade = 'INDIVIDUAL' | 'COLETIVA';

export type StatusTerapia = 'AGENDADA' | 'EM_ATENDIMENTO' | 'CONCLUIDA' | 'CANCELADA';

export type Presenca = 'PENDENTE' | 'PRESENTE' | 'FALTA_JUSTIFICADA' | 'FALTA_INJUSTIFICADA';

export interface PacienteTerapia {
  idCadastro: number;
  nome: string;
  presenca: Presenca;
  justificativa: string | null;
}

export interface EspecialistaTerapia {
  idCadastro: number;
  nome: string;
  especialidades: string[];
}

// Campos comuns da listagem geral e de /terapias/minhas.
interface TerapiaBase {
  idTerapia: number;
  // Nome do paciente na individual; "Terapia coletiva" na coletiva.
  titulo: string;
  modalidade: Modalidade;
  data: string;
  horaInicio: string;
  horaTermino: string;
  status: StatusTerapia;
  // true quando todos os pacientes justificaram a falta (especialista livre no horário).
  horarioLiberado: boolean;
  pacientes: PacienteTerapia[];
}

// Item de GET /terapias, GET /terapias/{id} e resposta do POST e do PATCH de presença.
export interface Terapia extends TerapiaBase {
  especialistas: EspecialistaTerapia[];
}

// Item de GET /terapias/minhas (sem o próprio especialista logado).
export interface TerapiaDoEspecialista extends TerapiaBase {
  outrosEspecialistas: string[];
}

export interface FiltroTerapias extends ParametrosPagina {
  status?: StatusTerapia[];
}

// Corpo do POST /terapias e do POST /terapias/verificar-conflitos.
export interface NovaTerapiaPayload {
  pacientesIds: number[];
  especialistasIds: number[];
  data: string;
  horaInicio: string;
  horaTermino: string;
}

export interface ConflitoHorario {
  tipo: 'PACIENTE' | 'ESPECIALISTA';
  idCadastro: number;
  nome: string;
  // Dados da terapia já existente que ocupa o horário.
  idTerapia: number;
  data: string;
  horaInicio: string;
  horaTermino: string;
}

export interface VerificacaoConflitos {
  possuiConflito: boolean;
  conflitos: ConflitoHorario[];
}

// PATCH /terapias/{id}/pacientes/{idPaciente}/presenca
// justificativa: obrigatória só para FALTA_JUSTIFICADA (até 255 caracteres).
export interface RegistroPresencaPayload {
  presenca: Presenca;
  justificativa?: string | null;
}
