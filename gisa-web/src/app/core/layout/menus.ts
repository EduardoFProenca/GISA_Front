// Catálogo das telas do sistema. Fonte única do menu lateral (☰) e do "Gestão Rápida" do Início:
// os dois mostram só o que as permissões do usuário liberam (funcionalidade, ver permissoes.ts).
// O nome do perfil não interfere: para liberar uma tela a um perfil, basta dar a permissão a ele.
//
// COMO MANTER: cada tela nova entra em TELAS, com a rota correspondente em features/telas.routes.ts
// (mesmo caminho e mesma funcionalidade/cadastro).
import { ICONES } from '../../shared/icons';
import { AcaoRapida } from '../../shared/components/painel-acoes/painel-acoes';
import { CadastroExigido, Funcionalidade, ROTA_INICIO } from '../auth/permissoes';

export interface ItemMenuSistema {
  label: string;
  icone: string;
  rota: string;
  // Título da seção onde o item aparece (itens seguidos com o mesmo grupo ficam juntos).
  grupo?: string;
}

interface Tela {
  label: string;
  descricao: string;
  icone: string;
  // Caminho a partir da raiz (ex.: 'pacientes' -> /pacientes).
  caminho: string;
  // Sem funcionalidade = qualquer usuário logado (respeitando `cadastro`).
  funcionalidade?: Funcionalidade;
  // Tela que só faz sentido para um tipo de cadastro (ex.: agenda do especialista).
  cadastro?: CadastroExigido;
  grupo: Grupo;
  // true = só no "Gestão Rápida" (atalho para uma ação), fora do menu lateral.
  soAtalho?: boolean;
}

// O que o usuário logado pode acessar (permissões e tipo de cadastro).
export interface Acesso {
  pode: (f: Funcionalidade) => boolean;
  temCadastro: (c: CadastroExigido) => boolean;
}

// Ordem das seções no menu e no "Gestão Rápida".
const GRUPOS = ['Meus atendimentos', 'Atendimento', 'Equipe', 'Configurações', 'Documentos', 'Segurança'] as const;
type Grupo = (typeof GRUPOS)[number];

const TELAS: Tela[] = [
  // Meus atendimentos (cadastro de especialista: usam /terapias/minhas, sem VISUALIZAR_TERAPIAS)
  { label: 'Minha Agenda', descricao: 'Semana e atendimentos', icone: ICONES.calendario, caminho: 'agenda', cadastro: 'ESPECIALISTA', grupo: 'Meus atendimentos' },
  { label: 'Minhas Terapias do Dia', descricao: 'Pacientes e horários de hoje', icone: ICONES.gestaoConsultas, caminho: 'minhas-terapias', cadastro: 'ESPECIALISTA', grupo: 'Meus atendimentos' },

  // Atendimento
  { label: 'Pacientes', descricao: 'Consultar pacientes', icone: ICONES.gestaoPacientes, caminho: 'pacientes', funcionalidade: 'VISUALIZAR_PACIENTES', grupo: 'Atendimento' },
  { label: 'Cadastrar Paciente', descricao: 'Novo registro no sistema', icone: ICONES.cadastrarPaciente, caminho: 'pacientes/novo', funcionalidade: 'CADASTRAR_PACIENTE', grupo: 'Atendimento', soAtalho: true },
  { label: 'Terapias do Dia', descricao: 'Registrar presença ou falta', icone: ICONES.gestaoConsultas, caminho: 'presenca', funcionalidade: 'VISUALIZAR_TERAPIAS', grupo: 'Atendimento' },
  { label: 'Agendamentos', descricao: 'Agendar, remarcar e cancelar terapias', icone: ICONES.calendario, caminho: 'terapias', funcionalidade: 'VISUALIZAR_TERAPIAS', grupo: 'Atendimento' },
  { label: 'Nova Terapia', descricao: 'Agendar terapia', icone: ICONES.calendario, caminho: 'terapias/nova', funcionalidade: 'AGENDAR_TERAPIA', grupo: 'Atendimento', soAtalho: true },

  // Equipe
  { label: 'Profissionais', descricao: 'Ver corpo clínico', icone: ICONES.gestaoProfissionais, caminho: 'profissionais/gerenciar', funcionalidade: 'VISUALIZAR_PROFISSIONAIS', grupo: 'Equipe' },
  { label: 'Cadastrar Profissional', descricao: 'Adicionar ao corpo clínico', icone: ICONES.cadastrarProfissional, caminho: 'profissionais/novo', funcionalidade: 'CADASTRAR_PROFISSIONAL', grupo: 'Equipe', soAtalho: true },

  // Configurações (tabelas de apoio)
  { label: 'Cargos', descricao: 'Funções internas', icone: ICONES.cargo, caminho: 'cargos', funcionalidade: 'GERENCIAR_CARGOS', grupo: 'Configurações' },
  { label: 'CBOs', descricao: 'Classificação de ocupações', icone: ICONES.lista, caminho: 'cbos', funcionalidade: 'GERENCIAR_CARGOS', grupo: 'Configurações' },
  { label: 'Especialidades', descricao: 'Áreas de atendimento', icone: ICONES.especialidade, caminho: 'especialidades', funcionalidade: 'GERENCIAR_ESPECIALIDADES', grupo: 'Configurações' },
  { label: 'Escolas', descricao: 'Escolas dos pacientes', icone: ICONES.escola, caminho: 'escolas', funcionalidade: 'GERENCIAR_ESCOLAS', grupo: 'Configurações' },
  { label: 'Perfis de Acesso', descricao: 'Permissões dos usuários', icone: ICONES.chave, caminho: 'perfis', funcionalidade: 'GERENCIAR_PERFIS', grupo: 'Configurações' },

  // Documentos (atestado e receita dependem do cadastro do especialista logado: /especialistas/me)
  { label: 'Emitir Atestado', descricao: 'Texto livre ou modelo', icone: ICONES.atestado, caminho: 'atestado', funcionalidade: 'EMITIR_ATESTADO', cadastro: 'ESPECIALISTA', grupo: 'Documentos' },
  { label: 'Emitir Receita', descricao: 'Imprimir receita do paciente', icone: ICONES.receita, caminho: 'receita', funcionalidade: 'EMITIR_RECEITA', cadastro: 'ESPECIALISTA', grupo: 'Documentos' },
  { label: 'Emitir Recusa', descricao: 'Declaração de recusa de atendimento', icone: ICONES.recusa, caminho: 'recusa', funcionalidade: 'EMITIR_RECUSA', grupo: 'Documentos' },

  // Segurança
  { label: 'Usuários do Sistema', descricao: 'Quem acessa e com qual perfil', icone: ICONES.usuarios, caminho: 'usuarios', funcionalidade: 'GERENCIAR_USUARIOS', grupo: 'Segurança' },
  { label: 'Auditoria', descricao: 'Logins, alterações e consultas', icone: ICONES.auditoria, caminho: 'auditoria', funcionalidade: 'VISUALIZAR_AUDITORIA', grupo: 'Segurança' },
];

// Telas liberadas ao usuário, agrupadas na ordem de GRUPOS.
function telasLiberadas(acesso: Acesso): Tela[] {
  return TELAS.filter(
    (t) => (!t.funcionalidade || acesso.pode(t.funcionalidade)) && (!t.cadastro || acesso.temCadastro(t.cadastro))
  ).sort((a, b) => GRUPOS.indexOf(a.grupo) - GRUPOS.indexOf(b.grupo));
}

const rotaDa = (tela: Tela) => `/${tela.caminho}`;

// Itens do menu lateral, com "Início" na frente e "Alterar minha senha" no fim.
export function itensDoMenu(acesso: Acesso): ItemMenuSistema[] {
  const inicio: ItemMenuSistema = { label: 'Início', icone: ICONES.inicio, rota: ROTA_INICIO };
  const senha: ItemMenuSistema = { label: 'Alterar minha senha', icone: ICONES.senha, rota: '/minha-senha', grupo: 'Minha conta' };
  const telas = telasLiberadas(acesso)
    .filter((t) => !t.soAtalho)
    .map((t) => ({ label: t.label, icone: t.icone, rota: rotaDa(t), grupo: t.grupo }));
  return [inicio, ...telas, senha];
}

// Botões do "Gestão Rápida" do Início (menu lateral + atalhos).
export function acoesRapidas(acesso: Acesso): AcaoRapida[] {
  return telasLiberadas(acesso).map((t) => ({ titulo: t.label, descricao: t.descricao, icone: t.icone, rota: rotaDa(t) }));
}
