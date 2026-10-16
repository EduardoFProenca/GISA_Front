import { Presenca, StatusTerapia, Terapia, TerapiaDoEspecialista } from '../../../core/models/terapia.model';

// Terapia da listagem geral ou de /terapias/minhas: a diferença é só como os especialistas vêm.
export type TerapiaDoDia = Terapia | TerapiaDoEspecialista;

export interface ResumoPresenca {
  terapias: number;
  presentes: number;
  faltas: number;
  pendentes: number;
}

export type SituacaoTerapia = 'PENDENTE' | 'REGISTRADA' | 'CANCELADA';

// Só conta pacientes de terapias não canceladas.
export function calcularResumo(terapias: TerapiaDoDia[]): ResumoPresenca {
  const pacientes = terapias.filter((t) => t.status !== 'CANCELADA').flatMap((t) => t.pacientes);
  return {
    terapias: terapias.length,
    presentes: pacientes.filter((p) => p.presenca === 'PRESENTE').length,
    faltas: pacientes.filter((p) => p.presenca === 'FALTA_JUSTIFICADA' || p.presenca === 'FALTA_INJUSTIFICADA').length,
    pendentes: pacientes.filter((p) => p.presenca === 'PENDENTE').length,
  };
}

// "Registrada" = todos os pacientes já tiveram a presença marcada.
export function presencaCompleta(t: TerapiaDoDia): boolean {
  return t.status !== 'CANCELADA' && t.pacientes.length > 0 && t.pacientes.every((p) => p.presenca !== 'PENDENTE');
}

export function situacaoDaTerapia(t: TerapiaDoDia): SituacaoTerapia {
  if (t.status === 'CANCELADA') return 'CANCELADA';
  return presencaCompleta(t) ? 'REGISTRADA' : 'PENDENTE';
}

// Multi-seleção: conjunto vazio = sem filtro (mostra tudo).
export function filtrarPorSituacao<T extends TerapiaDoDia>(terapias: T[], situacoes: ReadonlySet<string>): T[] {
  if (situacoes.size === 0) return terapias;
  return terapias.filter((t) => situacoes.has(situacaoDaTerapia(t)));
}

// Terapias de /terapias/minhas são sempre do especialista logado; nas da listagem geral, confere a lista.
export function participaDaTerapia(t: TerapiaDoDia, idEspecialista: number | undefined): boolean {
  return 'outrosEspecialistas' in t || t.especialistas.some((e) => e.idCadastro === idEspecialista);
}

export function nomesEspecialistas(t: TerapiaDoDia): string[] {
  return 'especialistas' in t ? t.especialistas.map((e) => e.nome) : t.outrosEspecialistas;
}

export function filtrarTerapias<T extends TerapiaDoDia>(terapias: T[], termo: string): T[] {
  const busca = termo.trim().toLowerCase();
  if (!busca) return terapias;
  return terapias.filter(
    (t) =>
      t.pacientes.some((p) => p.nome.toLowerCase().includes(busca)) ||
      nomesEspecialistas(t).some((nome) => nome.toLowerCase().includes(busca))
  );
}

// Substitui a terapia pela versão devolvida pela API (imutável).
// Em /minhas a lista não traz `especialistas` (só os outros): mantém esse formato.
export function substituirTerapia<T extends TerapiaDoDia>(terapias: T[], atualizada: Terapia): T[] {
  return terapias.map((t) => {
    if (t.idTerapia !== atualizada.idTerapia) return t;
    if ('outrosEspecialistas' in t) {
      const { especialistas: _, ...resto } = atualizada;
      return { ...t, ...resto } as T;
    }
    return atualizada as T;
  });
}

// Tooltip do botão de uma marcação fora de `presencasPermitidas`.
// A regra de datas fica no back; aqui só se lê a lista: antes do dia ela ainda
// permite desfazer (PENDENTE), depois do prazo só sobra a falta justificada.
export function motivoPresencaIndisponivel(permitidas: Presenca[]): string {
  if (permitidas.length === 0) return 'Nenhuma marcação disponível nesta terapia';
  if (permitidas.includes('PENDENTE')) return 'Disponível a partir do dia da terapia';
  return 'Prazo encerrado: só falta justificada';
}

export function horarioTerapia(t: { horaInicio: string; horaTermino: string }): string {
  return `${t.horaInicio.slice(0, 5)} – ${t.horaTermino.slice(0, 5)}`;
}

// "Ana Souza (Psicologia), Carlos Lima" na listagem geral; "com Carlos Lima" em /minhas.
export function especialistasTexto(t: TerapiaDoDia): string {
  if ('especialistas' in t) {
    return t.especialistas.length
      ? t.especialistas.map((e) => (e.especialidades.length ? `${e.nome} (${e.especialidades.join(', ')})` : e.nome)).join(', ')
      : 'Sem especialista';
  }
  return t.outrosEspecialistas.length ? `com ${t.outrosEspecialistas.join(', ')}` : 'Atendimento individual do especialista';
}

// Títulos do aviso de sucesso (AvisoSucessoService) ao marcar presença e ao mudar o status.
export const AVISO_PRESENCA: Record<Presenca, string> = {
  PRESENTE: 'Presença registrada',
  FALTA_JUSTIFICADA: 'Falta justificada registrada',
  FALTA_INJUSTIFICADA: 'Falta registrada',
  PENDENTE: 'Marcação desfeita',
};

export const AVISO_STATUS: Record<StatusTerapia, string> = {
  AGENDADA: 'Terapia agendada',
  EM_ATENDIMENTO: 'Atendimento iniciado',
  CONCLUIDA: 'Terapia concluída',
  CANCELADA: 'Terapia cancelada',
};

// Nome do paciente da terapia (para o detalhe do aviso).
export function nomePaciente(t: { pacientes: { idCadastro: number; nome: string }[] }, idPaciente: number): string {
  return t.pacientes.find((p) => p.idCadastro === idPaciente)?.nome ?? '';
}
