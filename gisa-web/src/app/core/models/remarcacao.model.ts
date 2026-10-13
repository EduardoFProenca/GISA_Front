// ATENÇÃO: o backend (API-GISA) ainda NÃO tem endpoints de remarcação. Este formato é a proposta do
// front; combinar com o back antes de integrar (ver AgendaEspecialistaService).

export type StatusRemarcacao = 'PENDENTE' | 'APROVADA' | 'RECUSADA';

// O mínimo que o modal precisa saber da sessão a remarcar.
export interface AlvoRemarcacao {
  idTerapia: number;
  pacienteNome: string;
  data: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  horaTermino: string;
}

// Corpo do POST /terapias/{idTerapia}/remarcacoes (nasce PENDENTE; o back identifica o especialista pelo JWT).
export interface SolicitacaoRemarcacaoPayload {
  motivo: string;
  novaData: string; // yyyy-MM-dd
  novaHoraInicio: string; // HH:mm
  novaHoraTermino: string;
}

export interface SolicitacaoRemarcacao {
  idSolicitacao: number;
  idTerapia: number;
  titulo: string; // nome do paciente / "Terapia coletiva"
  data: string;
  horaInicio: string;
  novaData: string;
  novaHoraInicio: string;
  novaHoraTermino: string;
  motivo: string;
  status: StatusRemarcacao;
  // Resposta da Secretaria/Coordenação (só quando status != PENDENTE).
  parecer: string | null;
  criadaEm: string; // UTC
  avaliadaEm: string | null; // UTC
}
