import { Modalidade, Presenca, StatusTerapia } from './terapia.model';

// Um horário da agenda do especialista = uma terapia + um paciente dela
// (terapia coletiva vira um item por paciente). Montado a partir de GET /terapias/minhas.
export interface ItemAgenda {
  idTerapia: number;
  idPaciente: number;
  pacienteNome: string;
  data: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  horaTermino: string;
  modalidade: Modalidade;
  statusTerapia: StatusTerapia;
  presenca: Presenca;
  // Os outros especialistas da mesma terapia (sem o logado).
  outrosEspecialistas: string[];
}

// Status mostrado na agenda: junta o status da terapia com a presença do paciente.
export type StatusAgenda =
  | 'AGENDADA'
  | 'PRESENTE'
  | 'FALTA_JUSTIFICADA'
  | 'FALTA_INJUSTIFICADA'
  | 'CONCLUIDA'
  | 'CANCELADA';
