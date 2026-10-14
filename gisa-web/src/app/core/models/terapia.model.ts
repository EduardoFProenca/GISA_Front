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
  // Preenchido só quando a terapia foi cancelada.
  motivoCancelamento?: string | null;
}

// Item de GET /terapias, GET /terapias/{id} e resposta de POST/PATCH (inclusive presença e status).
export interface Terapia extends TerapiaBase {
  especialistas: EspecialistaTerapia[];
}

// Item de GET /terapias/minhas (sem o próprio especialista logado).
export interface TerapiaDoEspecialista extends TerapiaBase {
  outrosEspecialistas: string[];
}

// Filtros de GET /terapias/minhas (size máximo 100).
// Use `data` OU o intervalo `inicio`/`fim` (yyyy-MM-dd, dias incluídos), não os dois.
export interface FiltroMinhasTerapias extends ParametrosPagina {
  status?: StatusTerapia[];
  data?: string;
  inicio?: string;
  fim?: string;
  idPaciente?: number;
}

// Filtros de GET /terapias. ID sem terapias devolve página vazia.
export interface FiltroTerapias extends FiltroMinhasTerapias {
  idEspecialista?: number;
}

// Corpo do POST /terapias.
export interface NovaTerapiaPayload {
  pacientesIds: number[];
  especialistasIds: number[];
  data: string;
  horaInicio: string;
  horaTermino: string;
}

// PATCH /terapias/{id}: só terapias AGENDADA; listas substituem as atuais.
// Paciente que continua mantém a presença; paciente novo entra como PENDENTE.
export type AtualizacaoTerapiaPayload = Partial<NovaTerapiaPayload>;

// POST /terapias/verificar-conflitos (idTerapiaIgnorada: ao validar uma edição).
export interface VerificarConflitosPayload extends NovaTerapiaPayload {
  idTerapiaIgnorada?: number;
}

// PATCH /terapias/{id}/status. Transições: AGENDADA -> EM_ATENDIMENTO -> CONCLUIDA;
// AGENDADA/EM_ATENDIMENTO -> CANCELADA (motivo obrigatório, até 255). CONCLUIDA e CANCELADA são finais.
export interface AlterarStatusTerapiaPayload {
  status: StatusTerapia;
  motivo?: string;
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
