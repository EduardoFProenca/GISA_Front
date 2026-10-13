import { ItemAgenda, StatusAgenda } from '../../../core/models/agenda-especialista.model';
import { TerapiaDoEspecialista } from '../../../core/models/terapia.model';
import { deIso, horaCurta, paraIso, paraIsoMinuto, somarDias } from '../../../shared/utils/data.util';

export const ROTULO_STATUS_AGENDA: Record<StatusAgenda, string> = {
  AGENDADA: 'Agendada',
  PRESENTE: 'Presente',
  FALTA_JUSTIFICADA: 'Falta justificada',
  FALTA_INJUSTIFICADA: 'Falta injustificada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

export const NOMES_DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Um item por paciente de cada terapia, em ordem de data e horário.
export function achatarTerapias(terapias: TerapiaDoEspecialista[]): ItemAgenda[] {
  return terapias
    .flatMap((t) =>
      t.pacientes.map(
        (p): ItemAgenda => ({
          idTerapia: t.idTerapia,
          idPaciente: p.idCadastro,
          pacienteNome: p.nome,
          data: t.data,
          horaInicio: horaCurta(t.horaInicio),
          horaTermino: horaCurta(t.horaTermino),
          modalidade: t.modalidade,
          statusTerapia: t.status,
          presenca: p.presenca,
          outrosEspecialistas: t.outrosEspecialistas,
        })
      )
    )
    .sort((a, b) => `${a.data}${a.horaInicio}`.localeCompare(`${b.data}${b.horaInicio}`));
}

// Combina o status da terapia com a presença do paciente.
export function statusAgenda(a: ItemAgenda): StatusAgenda {
  if (a.statusTerapia === 'CANCELADA') return 'CANCELADA';
  if (a.presenca === 'FALTA_JUSTIFICADA') return 'FALTA_JUSTIFICADA';
  if (a.presenca === 'FALTA_INJUSTIFICADA') return 'FALTA_INJUSTIFICADA';
  if (a.statusTerapia === 'CONCLUIDA') return 'CONCLUIDA';
  if (a.presenca === 'PRESENTE' || a.statusTerapia === 'EM_ATENDIMENTO') return 'PRESENTE';
  return 'AGENDADA';
}

export interface ResumoDia {
  total: number;
  atendidos: number;
  aguardando: number;
  faltas: number;
}

// Cancelados não entram em nenhum número. "Aguardando" = paciente já na recepção (presença registrada)
// e ainda não concluído.
export function resumoDoDia(doDia: ItemAgenda[]): ResumoDia {
  const status = doDia.map(statusAgenda).filter((s) => s !== 'CANCELADA');
  return {
    total: status.length,
    atendidos: status.filter((s) => s === 'CONCLUIDA').length,
    aguardando: status.filter((s) => s === 'PRESENTE').length,
    faltas: status.filter((s) => s === 'FALTA_JUSTIFICADA' || s === 'FALTA_INJUSTIFICADA').length,
  };
}

// Sessão em andamento agora ou, se não houver, a próxima do dia que ainda vai acontecer.
export function proximoPaciente(doDia: ItemAgenda[], agora: Date = new Date()): ItemAgenda | null {
  const agoraIso = paraIsoMinuto(agora);
  return (
    doDia
      .filter((a) => {
        const s = statusAgenda(a);
        return (s === 'AGENDADA' || s === 'PRESENTE') && `${a.data}T${a.horaTermino}` > agoraIso;
      })
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))[0] ?? null
  );
}

export interface DiaCalendario {
  iso: string;
  dia: number;
  doMes: boolean;
}

export interface GradeMes {
  dias: DiaCalendario[];
  inicioIso: string;
  fimIso: string;
}

// Grade do mês começando no domingo, com semanas completas. `mes` é 1-12.
export function montarGrade(ano: number, mes: number): GradeMes {
  const primeiro = new Date(ano, mes - 1, 1);
  const ultimo = new Date(ano, mes, 0);
  const inicio = new Date(ano, mes - 1, 1 - primeiro.getDay());
  const fim = new Date(ano, mes, 6 - ultimo.getDay());

  const dias: DiaCalendario[] = [];
  for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    dias.push({ iso: paraIso(d), dia: d.getDate(), doMes: d.getMonth() === mes - 1 });
  }
  return { dias, inicioIso: paraIso(inicio), fimIso: paraIso(fim) };
}

export function agruparPorDia(lista: ItemAgenda[]): Map<string, ItemAgenda[]> {
  const mapa = new Map<string, ItemAgenda[]>();
  for (const a of lista) mapa.set(a.data, [...(mapa.get(a.data) ?? []), a]);
  return mapa;
}

// Os 7 dias (domingo a sábado) da semana que contém `iso`.
export function diasDaSemana(iso: string): string[] {
  const domingo = somarDias(iso, -deIso(iso).getDay());
  return Array.from({ length: 7 }, (_, i) => somarDias(domingo, i));
}

export function rotuloMes(ano: number, mes: number): string {
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`;
}

function normalizar(t: string): string {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filtrarAgenda(lista: ItemAgenda[], termo: string, status: string, modalidade: string): ItemAgenda[] {
  const t = normalizar(termo.trim());
  return lista.filter(
    (a) =>
      (!t || normalizar(a.pacienteNome).includes(t)) &&
      (!status || statusAgenda(a) === status) &&
      (!modalidade || a.modalidade === modalidade)
  );
}

// Matrícula Única exibida nas telas. ATENÇÃO: a API não tem campo "matrícula" separado; usamos o
// idCadastro (com zeros à esquerda só para exibir). Trocar aqui se o back criar o campo.
export function formatarMatricula(idCadastro: number): string {
  return String(idCadastro).padStart(6, '0');
}
