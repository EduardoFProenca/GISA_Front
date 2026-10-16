// Arquivo único de controle de acesso do front: funcionalidades, permissões e tipo de cadastro.
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
  // Busca e detalhe de pacientes. Com só VISUALIZAR_PACIENTES_VINCULADOS (assistente social), a API
  // devolve apenas os pacientes vinculados ao usuário.
  VISUALIZAR_PACIENTES: ['VISUALIZAR_PACIENTES', 'VISUALIZAR_PACIENTES_VINCULADOS'],
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

// ---------- Tipo de cadastro ----------

// Algumas telas dependem do tipo de cadastro do usuário, e não de uma permissão: a agenda, as
// terapias do dia, o atestado e a receita usam dados que só o especialista tem (/terapias/minhas e
// /especialistas/me); "meus pacientes" só existe para o assistente social.
export type CadastroExigido = 'ESPECIALISTA' | 'ASSISTENTE_SOCIAL';

export function temCadastro(tipoCadastro: string | undefined, exigido: CadastroExigido): boolean {
  if (exigido === 'ESPECIALISTA') return tipoCadastro === 'ESPECIALISTA' || tipoCadastro === 'ESPECIALISTA_PJ';
  return tipoCadastro === exigido;
}

// Página inicial de todo usuário logado. O nome do perfil não interfere em nada: o que aparece no
// menu, nas telas e no Início vem das permissões (e, nos casos acima, do tipo de cadastro).
export const ROTA_INICIO = '/inicio';
