// Rótulos de exibição dos enums da API.
import { EstadoCivil, Sexo, StatusCadastro } from '../../core/models/comum.model';
import { GrauParentesco, StatusPaciente } from '../../core/models/paciente.model';
import { TipoEscola } from '../../core/models/escola.model';
import { TipoCadastro } from '../../core/models/auth.model';
import { TipoEventoPaciente } from '../../core/models/historico.model';
import { Modalidade, Presenca, StatusTerapia } from '../../core/models/terapia.model';

export const ROTULO_STATUS_PACIENTE: Record<StatusPaciente, string> = {
  MATRICULADO: 'Matriculado',
  ALTA: 'Alta',
  DESLIGADO: 'Desligado',
};

export const ROTULO_STATUS_CADASTRO: Record<StatusCadastro, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
};

export const ROTULO_PARENTESCO: Record<GrauParentesco, string> = {
  PAI: 'Pai',
  MAE: 'Mãe',
  AVO: 'Avô / Avó',
  TUTOR_LEGAL: 'Tutor legal',
  OUTRO: 'Outro',
};

export const ROTULO_TIPO_CADASTRO: Record<TipoCadastro, string> = {
  PESSOA: 'Administrador inicial',
  PROFISSIONAL: 'Profissional',
  ESPECIALISTA: 'Especialista',
  ESPECIALISTA_PJ: 'Especialista PJ',
  ASSISTENTE_SOCIAL: 'Assistente Social',
};

export const ROTULO_TIPO_ESCOLA: Record<TipoEscola, string> = {
  PUBLICA: 'Pública',
  PARTICULAR: 'Particular',
};

export const ROTULO_ESTADO_CIVIL: Record<EstadoCivil, string> = {
  SOLTEIRO: 'Solteiro(a)',
  CASADO: 'Casado(a)',
  VIUVO: 'Viúvo(a)',
  SEPARADO: 'Separado(a)',
  DIVORCIADO: 'Divorciado(a)',
};

export const ROTULO_EVENTO_PACIENTE: Record<TipoEventoPaciente, string> = {
  CADASTRO: 'Cadastro',
  DADOS_ALTERADOS: 'Dados alterados',
  STATUS_PACIENTE_ALTERADO: 'Status alterado',
  INATIVADO: 'Inativado',
  REATIVADO: 'Reativado',
  RESPONSAVEL_VINCULADO: 'Responsável vinculado',
  RESPONSAVEL_DESVINCULADO: 'Responsável desvinculado',
  TERAPIA_AGENDADA: 'Terapia agendada',
  TERAPIA_ALTERADA: 'Terapia alterada',
  TERAPIA_CANCELADA: 'Terapia cancelada',
  PRESENCA_REGISTRADA: 'Presença registrada',
};

// Cor de cada evento do histórico do paciente: verde = algo começou ou deu certo, amarelo = mudança,
// vermelho = cancelamento, falta ou inativação, cinza = marcação desfeita.
export type TomEventoPaciente = 'verde' | 'amarelo' | 'vermelho' | 'cinza';

const TOM_EVENTO_PACIENTE: Record<Exclude<TipoEventoPaciente, 'PRESENCA_REGISTRADA'>, TomEventoPaciente> = {
  CADASTRO: 'verde',
  REATIVADO: 'verde',
  RESPONSAVEL_VINCULADO: 'verde',
  TERAPIA_AGENDADA: 'verde',
  DADOS_ALTERADOS: 'amarelo',
  STATUS_PACIENTE_ALTERADO: 'amarelo',
  RESPONSAVEL_DESVINCULADO: 'amarelo',
  TERAPIA_ALTERADA: 'amarelo',
  INATIVADO: 'vermelho',
  TERAPIA_CANCELADA: 'vermelho',
};

// A presença não tem tipo próprio por resultado: a API termina a descrição com ele
// ("...: compareceu.", "...: falta justificada.", "...: falta.", "...: marcação desfeita (pendente).").
export function tomEventoPaciente(evento: { tipo: TipoEventoPaciente; descricao: string }): TomEventoPaciente {
  if (evento.tipo !== 'PRESENCA_REGISTRADA') return TOM_EVENTO_PACIENTE[evento.tipo];
  const resultado = evento.descricao.slice(evento.descricao.lastIndexOf(':') + 1).trim();
  if (resultado.startsWith('compareceu')) return 'verde';
  if (resultado.startsWith('falta justificada')) return 'amarelo';
  if (resultado.startsWith('falta')) return 'vermelho';
  return 'cinza';
}

export const ROTULO_STATUS_TERAPIA: Record<StatusTerapia, string> = {
  AGENDADA: 'Agendada',
  EM_ATENDIMENTO: 'Em atendimento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

// Cor do indicador de cada status (filtros e badges).
export const COR_STATUS_TERAPIA: Record<StatusTerapia, string> = {
  AGENDADA: 'var(--cor-primaria)',
  EM_ATENDIMENTO: 'var(--cor-alerta)',
  CONCLUIDA: 'var(--cor-sucesso)',
  CANCELADA: 'var(--vermelho-500)',
};

export const ROTULO_MODALIDADE: Record<Modalidade, string> = {
  INDIVIDUAL: 'Individual',
  COLETIVA: 'Coletiva',
};

export const ROTULO_PRESENCA: Record<Presenca, string> = {
  PENDENTE: 'Pendente',
  PRESENTE: 'Compareceu',
  FALTA_JUSTIFICADA: 'Falta justificada',
  FALTA_INJUSTIFICADA: 'Falta',
};

export const ROTULO_SEXO: Record<Sexo, string> = {
  F: 'Feminino',
  M: 'Masculino',
  O: 'Outro',
};

// diaSemana da API: 1 = Segunda ... 7 = Domingo.
export const ROTULO_DIA_SEMANA: Record<number, string> = {
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
  7: 'Domingo',
};

// Detalhe do aviso de inativação do paciente (terapias futuras afetadas). null = nenhuma.
export function resumoInativacaoPaciente(r: { terapiasCanceladas: number; terapiasColetivasRemovido: number } | null): string | null {
  if (!r) return null;
  const partes: string[] = [];
  if (r.terapiasCanceladas) {
    const n = r.terapiasCanceladas;
    partes.push(n > 1 ? `${n} terapias individuais canceladas` : '1 terapia individual cancelada');
  }
  if (r.terapiasColetivasRemovido) {
    const n = r.terapiasColetivasRemovido;
    partes.push(n > 1 ? `retirado de ${n} terapias coletivas` : 'retirado de 1 terapia coletiva');
  }
  return partes.length ? partes.join(' e ') : null;
}
