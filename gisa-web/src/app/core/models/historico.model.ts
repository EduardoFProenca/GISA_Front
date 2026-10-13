// Histórico de atividades do paciente (GET /pacientes/{id}/historico).
// Eventos de negócio com descrição pronta para exibir; não é a auditoria.
import { ParametrosPagina } from './comum.model';

export type TipoEventoPaciente =
  | 'CADASTRO'
  | 'DADOS_ALTERADOS'
  | 'STATUS_PACIENTE_ALTERADO'
  | 'INATIVADO'
  | 'REATIVADO'
  | 'RESPONSAVEL_VINCULADO'
  | 'RESPONSAVEL_DESVINCULADO'
  | 'TERAPIA_AGENDADA'
  | 'TERAPIA_ALTERADA'
  | 'TERAPIA_CANCELADA'
  | 'PRESENCA_REGISTRADA';

export interface EventoPaciente {
  idEvento: number;
  // UTC.
  dataHora: string;
  tipo: TipoEventoPaciente;
  descricao: string;
  // Só nos eventos de terapia.
  idTerapia: number | null;
  // Quem fez a ação.
  usuario: { idCadastro: number; nome: string } | null;
}

// Padrão: size 20, sort dataHora,desc.
export interface FiltroHistoricoPaciente extends ParametrosPagina {
  tipo?: TipoEventoPaciente[];
  inicio?: string;
  fim?: string;
}
