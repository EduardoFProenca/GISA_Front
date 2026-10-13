// Trilha de auditoria (ver AUDITORIA.md). Exige ACESSO_TOTAL.
import { ParametrosPagina } from './comum.model';

export type AcaoAuditoria = 'LOGIN' | 'CRIACAO' | 'ALTERACAO' | 'EXCLUSAO' | 'CONSULTA';

// Item de GET /auditoria. dataHora vem em UTC.
export interface RegistroAuditoria {
  idLog: number;
  dataHora: string;
  cpfUsuario: string | null;
  // null quando o CPF não pertence a ninguém cadastrado.
  nomeUsuario: string | null;
  acao: AcaoAuditoria;
  metodo: string;
  caminho: string;
  statusHttp: number;
  sucesso: boolean;
  ip: string;
}

export interface FiltroAuditoria extends ParametrosPagina {
  // Início do CPF (máscara ignorada).
  cpf?: string;
  acao?: AcaoAuditoria[];
  // yyyy-MM-dd; o dia final é incluído inteiro.
  inicio?: string;
  fim?: string;
}
