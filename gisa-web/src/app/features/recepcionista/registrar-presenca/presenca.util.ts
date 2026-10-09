import { Modalidade, StatusTerapia } from '../../../core/models/consulta.model';
import {
  ConsultaDiaria,
  PacienteConsulta,
  StatusPresenca,
} from '../../../core/models/consulta-diaria.model';

export interface ResumoPresenca {
  consultas: number;
  presentes: number;
  faltas: number;
  pendentes: number;
}

export const LABEL_STATUS: Record<StatusTerapia, string> = {
  [StatusTerapia.AGENDADA]: 'Agendada',
  [StatusTerapia.CONCLUIDA]: 'Concluída',
  [StatusTerapia.CANCELADA]: 'Cancelada',
  [StatusTerapia.EM_ATENDIMENTO]: 'Em atendimento',
};

export const LABEL_MODALIDADE: Record<Modalidade, string> = {
  [Modalidade.INDIVIDUAL]: 'Individual',
  [Modalidade.COLETIVA]: 'Coletiva',
};

export const LABEL_PRESENCA: Record<StatusPresenca, string> = {
  [StatusPresenca.PRESENTE]: 'Compareceu',
  [StatusPresenca.FALTA_JUSTIFICADA]: 'Falta justificada',
  [StatusPresenca.FALTA_INJUSTIFICADA]: 'Falta',
};

// Só conta pacientes de consultas não canceladas.
export function calcularResumo(consultas: ConsultaDiaria[]): ResumoPresenca {
  const pacientes = consultas
    .filter((c) => c.status !== StatusTerapia.CANCELADA)
    .flatMap((c) => c.pacientes);

  return {
    consultas: consultas.length,
    presentes: pacientes.filter((p) => p.presenca === StatusPresenca.PRESENTE).length,
    faltas: pacientes.filter(
      (p) =>
        p.presenca === StatusPresenca.FALTA_JUSTIFICADA ||
        p.presenca === StatusPresenca.FALTA_INJUSTIFICADA
    ).length,
    pendentes: pacientes.filter((p) => p.presenca === null).length,
  };
}

export function filtrarConsultas(consultas: ConsultaDiaria[], termo: string): ConsultaDiaria[] {
  const t = termo.trim().toLowerCase();
  if (!t) return consultas;
  return consultas.filter(
    (c) =>
      c.pacientes.some((p) => p.nome.toLowerCase().includes(t)) ||
      c.especialistas.some((e) => e.nome.toLowerCase().includes(t))
  );
}

// Devolve nova lista com o paciente atualizado (imutável).
export function atualizarPaciente(
  consultas: ConsultaDiaria[],
  idTerapia: number,
  atualizado: PacienteConsulta
): ConsultaDiaria[] {
  return consultas.map((c) =>
    c.idTerapia !== idTerapia
      ? c
      : {
          ...c,
          pacientes: c.pacientes.map((p) => (p.idPaciente === atualizado.idPaciente ? atualizado : p)),
        }
  );
}

export function horarioConsulta(c: ConsultaDiaria): string {
  const inicio = c.dataHoraInicio.split('T')[1]?.slice(0, 5) ?? '';
  const fim = c.dataHoraFim.split('T')[1]?.slice(0, 5) ?? '';
  return fim ? `${inicio} – ${fim}` : inicio;
}

export function especialistasTexto(c: ConsultaDiaria): string {
  return c.especialistas.length ? c.especialistas.map((e) => e.nome).join(', ') : 'Sem especialista';
}