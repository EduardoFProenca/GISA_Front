// Arquivo único de controle de acesso do front: funcionalidades, permissões e painéis.
//
// COMO MANTER:
// - Cada funcionalidade do front aponta para as permissões do back (GET /api/permissoes, ver PERFIS.md)
//   que a liberam. Hoje cada uma tem uma permissão de mesmo nome no back.
// - `null` = liberada para qualquer usuário logado (use só para algo que o back não controla).
// - Quem tem ACESSO_TOTAL pode tudo.
// - Esconder um botão aqui é só conforto: quem garante o acesso é a API, que responde 403.

export const ACESSO_TOTAL = 'ACESSO_TOTAL';

export const FUNCIONALIDADES = {
  // Pacientes
  VISUALIZAR_PACIENTES: ['VISUALIZAR_PACIENTES'],
  CADASTRAR_PACIENTE: ['CADASTRAR_PACIENTE'],
  EDITAR_PACIENTE: ['EDITAR_PACIENTE'],
  INATIVAR_PACIENTE: ['INATIVAR_PACIENTE'],
  VISUALIZAR_HISTORICO_PACIENTE: ['VISUALIZAR_HISTORICO_PACIENTE'],

  // Profissionais, especialistas e PJ
  VISUALIZAR_PROFISSIONAIS: ['VISUALIZAR_PROFISSIONAIS'],
  CADASTRAR_PROFISSIONAL: ['CADASTRAR_PROFISSIONAL'],
  CADASTRAR_ESPECIALISTA: ['CADASTRAR_ESPECIALISTA'],
  CADASTRAR_ESPECIALISTA_PJ: ['CADASTRAR_ESPECIALISTA_PJ'],
  EDITAR_PROFISSIONAL: ['EDITAR_PROFISSIONAL'],
  INATIVAR_PROFISSIONAL: ['INATIVAR_PROFISSIONAL'],
  // Usuários de acesso: conceder, trocar perfil, redefinir senha, retirar acesso. Também é exigida
  // para cadastrar "com acesso" e para mandar idPerfil no PATCH de profissional (00-GERAL.md).
  GERENCIAR_USUARIOS: ['GERENCIAR_USUARIOS'],

  // Terapias
  VISUALIZAR_TERAPIAS: ['VISUALIZAR_TERAPIAS'],
  AGENDAR_TERAPIA: ['AGENDAR_TERAPIA'],
  EDITAR_TERAPIA: ['EDITAR_TERAPIA'],
  ALTERAR_STATUS_TERAPIA: ['ALTERAR_STATUS_TERAPIA'],
  REGISTRAR_PRESENCA: ['REGISTRAR_PRESENCA'],

  // Documentos impressos (só o front usa; a API não tem rota de documentos).
  EMITIR_ATESTADO: ['EMITIR_ATESTADO'],
  EMITIR_RECEITA: ['EMITIR_RECEITA'],
  EMITIR_RECUSA: ['EMITIR_RECUSA'],

  // Tabelas de apoio e segurança
  GERENCIAR_CARGOS: ['GERENCIAR_CARGOS'],
  GERENCIAR_PERFIS: ['GERENCIAR_PERFIS'],
  GERENCIAR_ESCOLAS: ['GERENCIAR_ESCOLAS'],
  GERENCIAR_ESPECIALIDADES: ['GERENCIAR_ESPECIALIDADES'],
  VISUALIZAR_AUDITORIA: ['VISUALIZAR_AUDITORIA'],
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

interface UsuarioPainel {
  perfil: { nome: string };
  permissoes: readonly { nome: string }[];
  tipoCadastro: string;
}

function ehCadastroDeEspecialista(u: UsuarioPainel): boolean {
  return u.tipoCadastro === 'ESPECIALISTA' || u.tipoCadastro === 'ESPECIALISTA_PJ';
}

// O painel do especialista depende de terapias do próprio usuário (/terapias/minhas), que a API
// só atende para cadastros de especialista/PJ: o perfil "Especialista" sozinho não basta.
function perfilIncompativel(u: UsuarioPainel, painel: Painel): boolean {
  return painel === 'ESPECIALISTA' && !ehCadastroDeEspecialista(u);
}

// Painel pelo nome do perfil. Sem correspondência (ou incompatível com o cadastro): ACESSO_TOTAL abre
// o do administrador; especialista/PJ abre o do especialista; os demais ficam sem painel (null).
export function painelDoUsuario(usuario: UsuarioPainel): Painel | null {
  const porPerfil = PAINEL_POR_PERFIL[normalizarNomePerfil(usuario.perfil.nome)];
  if (porPerfil && !perfilIncompativel(usuario, porPerfil)) return porPerfil;
  if (usuario.permissoes.some((p) => p.nome === ACESSO_TOTAL)) return 'ADMINISTRADOR';
  if (ehCadastroDeEspecialista(usuario)) return 'ESPECIALISTA';
  return null;
}

// Explica por que o usuário ficou sem painel (mensagem do login).
export function motivoSemPainel(usuario: UsuarioPainel): string {
  const porPerfil = PAINEL_POR_PERFIL[normalizarNomePerfil(usuario.perfil.nome)];
  if (porPerfil && perfilIncompativel(usuario, porPerfil)) {
    return `O perfil "${usuario.perfil.nome}" só pode ser usado por cadastros de especialista. Procure o administrador para ajustar o seu perfil.`;
  }
  return `O perfil "${usuario.perfil.nome}" não tem acesso a nenhum painel. Procure o administrador.`;
}
