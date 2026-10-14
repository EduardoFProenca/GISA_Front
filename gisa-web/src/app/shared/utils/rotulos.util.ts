// Rótulos de exibição dos enums da API.
import { EstadoCivil, StatusCadastro } from '../../core/models/comum.model';
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

export const ROTULO_STATUS_TERAPIA: Record<StatusTerapia, string> = {
  AGENDADA: 'Agendada',
  EM_ATENDIMENTO: 'Em atendimento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

// Cor do indicador de cada status (filtros e badges).
export const COR_STATUS_TERAPIA: Record<StatusTerapia, string> = {
  AGENDADA: '#2563eb',
  EM_ATENDIMENTO: '#d97706',
  CONCLUIDA: '#16a34a',
  CANCELADA: '#ef4444',
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
