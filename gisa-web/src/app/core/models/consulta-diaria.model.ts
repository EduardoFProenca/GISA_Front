// LEGADO: formato antigo, sem correspondência na API. Substituído por terapia.model.ts na Etapa 3.
import { Modalidade, StatusTerapia } from './consulta.model';

export enum StatusPresenca {
  PRESENTE = 'PRESENTE',
  FALTA_JUSTIFICADA = 'FALTA_JUSTIFICADA',
  FALTA_INJUSTIFICADA = 'FALTA_INJUSTIFICADA',
}

export interface PacienteConsulta {
  idPaciente: number;
  nome: string;
  // null = recepção ainda não registrou
  presenca: StatusPresenca | null;
  justificativa: string | null;
}

export interface EspecialistaConsulta {
  idEspecialista: number;
  nome: string;
}

export interface ConsultaDiaria {
  idTerapia: number;
  dataHoraInicio: string;
  dataHoraFim: string;
  modalidade: Modalidade;
  status: StatusTerapia;
  pacientes: PacienteConsulta[];
  especialistas: EspecialistaConsulta[];
}

export interface RegistrarPresencaRequest {
  presenca: StatusPresenca;
  justificativa?: string | null;
}