// Arquivo único de controle de acesso do front: funcionalidades, permissões e painéis.
//
// COMO MANTER:
// - Cada funcionalidade do front aponta para as permissões do back (GET /api/permissoes) que a liberam.
// - `null` = o back ainda não tem permissão para ela: fica liberada para qualquer usuário logado.
//   Quando a permissão for criada no back, troque o `null` pela lista com o nome dela.
// - Quem tem ACESSO_TOTAL pode tudo.

export const ACESSO_TOTAL = 'ACESSO_TOTAL';

export const FUNCIONALIDADES = {
  // Pacientes
  VISUALIZAR_PACIENTES: null,
  CADASTRAR_PACIENTE: null,
  EDITAR_PACIENTE: null,
  INATIVAR_PACIENTE: null,
  VISUALIZAR_HISTORICO_PACIENTE: null,

  // Profissionais, especialistas e PJ
  VISUALIZAR_PROFISSIONAIS: null,
  CADASTRAR_PROFISSIONAL: ['CADASTRAR_PROFISSIONAL'],
  CADASTRAR_ESPECIALISTA: ['CADASTRAR_ESPECIALISTA'],
  CADASTRAR_ESPECIALISTA_PJ: ['CADASTRAR_ESPECIALISTA_PJ'],
  EDITAR_PROFISSIONAL: null,
  INATIVAR_PROFISSIONAL: null,
  // Conceder acesso ao sistema e redefinir a senha de outro usuário.
  GERENCIAR_USUARIOS: ['CADASTRAR_USUARIO'],

  // Terapias
  VISUALIZAR_TERAPIAS: null,
  AGENDAR_TERAPIA: null,
  EDITAR_TERAPIA: null,
  ALTERAR_STATUS_TERAPIA: null,
  REGISTRAR_PRESENCA: null,

  // Documentos impressos
  EMITIR_RECEITA: null,
  EMITIR_ATESTADO: null,
  EMITIR_RECUSA: null,

  // Administração
  GERENCIAR_CARGOS: null,
  GERENCIAR_PERFIS: null,
  VISUALIZAR_AUDITORIA: [ACESSO_TOTAL],
} satisfies Record<string, readonly string[] | null>;

export type Funcionalidade = keyof typeof FUNCIONALIDADES;

// `permissoes`: nomes das permissões do usuário logado.
export function podeAcessar(permissoes: readonly string[], funcionalidade: Funcionalidade): boolean {
  if (permissoes.includes(ACESSO_TOTAL)) return true;
  const exigidas: readonly string[] | null = FUNCIONALIDADES[funcionalidade];
  return exigidas === null || exigidas.some((p) => permissoes.includes(p));
}

// ---------- Painéis ----------

// Rota base de cada painel.
export const PAINEIS = {
  ADMINISTRADOR: '/administrador',
  RECEPCAO: '/recepcao',
  ESPECIALISTA: '/especialista',
  ASSISTENTE_SOCIAL: '/assistente-social',
} as const;

export type Painel = keyof typeof PAINEIS;

// Nome do perfil (GET /api/perfis), normalizado: minúsculo, sem acento, separadores viram espaço.
// Para um perfil novo abrir um painel, acrescente o nome dele aqui.
const PAINEL_POR_PERFIL: Record<string, Painel> = {
  'administrador': 'ADMINISTRADOR',
  'recepcao': 'RECEPCAO',
  'recepcionista': 'RECEPCAO',
  'especialista': 'ESPECIALISTA',
  'assistente social': 'ASSISTENTE_SOCIAL',
};

export function normalizarNomePerfil(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ')
    .trim();
}

// Painel pelo nome do perfil. Sem correspondência: ACESSO_TOTAL abre o do administrador;
// especialista/PJ abre o do especialista; os demais ficam sem painel (null).
export function painelDoUsuario(usuario: {
  perfil: { nome: string };
  permissoes: readonly { nome: string }[];
  tipoCadastro: string;
}): Painel | null {
  const porPerfil = PAINEL_POR_PERFIL[normalizarNomePerfil(usuario.perfil.nome)];
  if (porPerfil) return porPerfil;
  if (usuario.permissoes.some((p) => p.nome === ACESSO_TOTAL)) return 'ADMINISTRADOR';
  if (usuario.tipoCadastro === 'ESPECIALISTA' || usuario.tipoCadastro === 'ESPECIALISTA_PJ') return 'ESPECIALISTA';
  return null;
}
