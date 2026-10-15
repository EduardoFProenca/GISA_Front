import { AcaoAuditoria } from '../../../core/models/auditoria.model';

// Só são registradas alterações, logins que FALHARAM e consultas ao detalhe de paciente (AUDITORIA.md).
export const ROTULO_ACAO: Record<AcaoAuditoria, string> = {
  LOGIN: 'Login falhou',
  CRIACAO: 'Criação',
  ALTERACAO: 'Alteração',
  EXCLUSAO: 'Exclusão',
  CONSULTA: 'Consulta',
};

// Abas da tela: cada categoria é um valor de `acao` da API (null = todas).
export const CATEGORIAS: { acao: AcaoAuditoria | null; rotulo: string }[] = [
  { acao: null, rotulo: 'Todas' },
  { acao: 'LOGIN', rotulo: 'Logins que falharam' },
  { acao: 'CRIACAO', rotulo: 'Criações' },
  { acao: 'ALTERACAO', rotulo: 'Alterações' },
  { acao: 'EXCLUSAO', rotulo: 'Exclusões' },
  { acao: 'CONSULTA', rotulo: 'Consultas de paciente' },
];

// Primeiro trecho do caminho -> nome do que foi acessado.
const RECURSOS: Record<string, string> = {
  auth: 'Login',
  pacientes: 'Paciente',
  responsaveis: 'Responsável',
  profissionais: 'Profissional',
  especialistas: 'Especialista',
  'assistentes-sociais': 'Assistente social',
  terapias: 'Terapia',
  usuarios: 'Usuário',
  perfis: 'Perfil',
  permissoes: 'Permissão',
  cargos: 'Cargo',
  cbos: 'CBO',
  escolas: 'Escola',
  especialidades: 'Especialidade',
  cids: 'CID',
  auditoria: 'Auditoria',
};

// "/api/pacientes/5/historico" -> "Paciente 5"; "/api/especialistas/pj/12" -> "Especialista 12".
// Caminho fora do padrão: devolve o próprio caminho.
export function descreverCaminho(caminho: string): string {
  const partes = caminho.replace(/^\/?api\//, '').split('/').filter(Boolean);
  const recurso = RECURSOS[partes[0]];
  if (!recurso) return caminho;
  const id = partes.slice(1).find((p) => /^\d+$/.test(p));
  return id ? `${recurso} ${id}` : recurso;
}
