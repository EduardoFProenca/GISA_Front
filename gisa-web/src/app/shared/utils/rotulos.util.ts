// Rótulos de exibição dos enums da API.
import { EstadoCivil, StatusCadastro } from '../../core/models/comum.model';
import { GrauParentesco, StatusPaciente } from '../../core/models/paciente.model';
import { TipoEscola } from '../../core/models/escola.model';
import { TipoEventoPaciente } from '../../core/models/historico.model';

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
