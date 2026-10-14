// Catálogo das telas de cada painel. Fonte única do menu lateral (☰) e do "Gestão Rápida" do
// Início: os dois mostram só o que as permissões do usuário liberam (funcionalidade, ver
// permissoes.ts). Para liberar uma tela a um perfil, basta dar a permissão a ele no back.
//
// COMO MANTER:
// - Tela que existe em todos os painéis (pacientes, terapias, recusa...): TELAS_COMUNS, com a rota
//   correspondente em features/telas-comuns.routes.ts.
// - Tela que depende do painel (ex.: agenda do especialista, cargos do admin): TELAS_PROPRIAS.
import { ICONES } from '../../shared/icons';
import { AcaoRapida } from '../../shared/components/painel-acoes/painel-acoes';
import { Funcionalidade, Painel, PAINEIS } from '../auth/permissoes';

export interface ItemMenuPainel {
  label: string;
  icone: string;
  rota: string;
  // Sem funcionalidade = visível para qualquer usuário do painel.
  funcionalidade?: Funcionalidade;
  // Título da seção onde o item aparece (itens seguidos com o mesmo grupo ficam juntos).
  grupo?: string;
}

interface Tela {
  label: string;
  descricao: string;
  icone: string;
  // Relativo à base do painel (ex.: 'pacientes' -> /recepcao/pacientes).
  caminho: string;
  funcionalidade?: Funcionalidade;
  grupo: Grupo;
  // true = só no "Gestão Rápida" (atalho para uma ação), fora do menu lateral.
  soAtalho?: boolean;
}

// Ordem das seções no menu e no "Gestão Rápida".
const GRUPOS = ['Meus atendimentos', 'Atendimento', 'Equipe', 'Configurações', 'Documentos', 'Segurança'] as const;
type Grupo = (typeof GRUPOS)[number];

const TELAS_COMUNS: Tela[] = [
  { label: 'Pacientes', descricao: 'Consultar pacientes', icone: ICONES.gestaoPacientes, caminho: 'pacientes', funcionalidade: 'VISUALIZAR_PACIENTES', grupo: 'Atendimento' },
  { label: 'Cadastrar Paciente', descricao: 'Novo registro no sistema', icone: ICONES.cadastrarPaciente, caminho: 'pacientes/novo', funcionalidade: 'CADASTRAR_PACIENTE', grupo: 'Atendimento', soAtalho: true },
  { label: 'Terapias do Dia', descricao: 'Registrar presença ou falta', icone: ICONES.gestaoConsultas, caminho: 'presenca', funcionalidade: 'VISUALIZAR_TERAPIAS', grupo: 'Atendimento' },
  { label: 'Agendamentos', descricao: 'Agendar, remarcar e cancelar terapias', icone: ICONES.calendario, caminho: 'terapias', funcionalidade: 'VISUALIZAR_TERAPIAS', grupo: 'Atendimento' },
  { label: 'Nova Terapia', descricao: 'Agendar terapia', icone: ICONES.calendario, caminho: 'terapias/nova', funcionalidade: 'AGENDAR_TERAPIA', grupo: 'Atendimento', soAtalho: true },
  { label: 'Emitir Recusa', descricao: 'Declaração de recusa de atendimento', icone: ICONES.recusa, caminho: 'recusa', funcionalidade: 'EMITIR_RECUSA', grupo: 'Documentos' },
];

const TELAS_PROPRIAS: Record<Painel, Tela[]> = {
  ADMINISTRADOR: [
    { label: 'Profissionais', descricao: 'Ver corpo clínico', icone: ICONES.gestaoProfissionais, caminho: 'profissionais/gerenciar', funcionalidade: 'VISUALIZAR_PROFISSIONAIS', grupo: 'Equipe' },
    { label: 'Cadastrar Profissional', descricao: 'Adicionar ao corpo clínico', icone: ICONES.cadastrarProfissional, caminho: 'profissionais/novo', funcionalidade: 'CADASTRAR_PROFISSIONAL', grupo: 'Equipe', soAtalho: true },
    { label: 'Cargos', descricao: 'Funções internas', icone: ICONES.cargo, caminho: 'cargos', funcionalidade: 'GERENCIAR_CARGOS', grupo: 'Configurações' },
    { label: 'CBOs', descricao: 'Classificação de ocupações', icone: ICONES.lista, caminho: 'cbos', funcionalidade: 'GERENCIAR_CARGOS', grupo: 'Configurações' },
    { label: 'Especialidades', descricao: 'Áreas de atendimento', icone: ICONES.especialidade, caminho: 'especialidades', funcionalidade: 'GERENCIAR_ESPECIALIDADES', grupo: 'Configurações' },
    { label: 'Escolas', descricao: 'Escolas dos pacientes', icone: ICONES.escola, caminho: 'escolas', funcionalidade: 'GERENCIAR_ESCOLAS', grupo: 'Configurações' },
    { label: 'Perfis de Acesso', descricao: 'Permissões dos usuários', icone: ICONES.chave, caminho: 'perfis', funcionalidade: 'GERENCIAR_PERFIS', grupo: 'Configurações' },
    { label: 'Usuários do Sistema', descricao: 'Quem acessa e com qual perfil', icone: ICONES.usuarios, caminho: 'usuarios', funcionalidade: 'GERENCIAR_USUARIOS', grupo: 'Segurança' },
    { label: 'Auditoria', descricao: 'Logins, alterações e consultas', icone: ICONES.auditoria, caminho: 'auditoria', funcionalidade: 'VISUALIZAR_AUDITORIA', grupo: 'Segurança' },
  ],
  RECEPCAO: [],
  ESPECIALISTA: [
    // Agenda e terapias do dia usam /terapias/minhas (basta ser especialista; sem VISUALIZAR_TERAPIAS).
    { label: 'Minha Agenda', descricao: 'Semana e atendimentos', icone: ICONES.calendario, caminho: 'agenda', grupo: 'Meus atendimentos' },
    { label: 'Minhas Terapias do Dia', descricao: 'Pacientes e horários de hoje', icone: ICONES.gestaoConsultas, caminho: 'minhas-terapias', grupo: 'Meus atendimentos' },
    // Atestado e receita dependem do cadastro do especialista logado (/especialistas/me).
    { label: 'Emitir Atestado', descricao: 'Texto livre ou modelo', icone: ICONES.atestado, caminho: 'atestado', funcionalidade: 'EMITIR_ATESTADO', grupo: 'Documentos' },
    { label: 'Emitir Receita', descricao: 'Imprimir receita do paciente', icone: ICONES.receita, caminho: 'receita', funcionalidade: 'EMITIR_RECEITA', grupo: 'Documentos' },
  ],
  ASSISTENTE_SOCIAL: [],
};

// Telas do painel liberadas ao usuário, agrupadas na ordem de GRUPOS.
function telasDoPainel(painel: Painel, pode: (f: Funcionalidade) => boolean): Tela[] {
  return [...TELAS_PROPRIAS[painel], ...TELAS_COMUNS]
    .filter((t) => !t.funcionalidade || pode(t.funcionalidade))
    .sort((a, b) => GRUPOS.indexOf(a.grupo) - GRUPOS.indexOf(b.grupo));
}

const rotaDa = (painel: Painel, tela: Tela) => `${PAINEIS[painel]}/${tela.caminho}`;

// Itens do menu lateral, com "Início" na frente e "Alterar minha senha" no fim.
export function itensDoMenu(painel: Painel, pode: (f: Funcionalidade) => boolean): ItemMenuPainel[] {
  const inicio: ItemMenuPainel = { label: 'Início', icone: ICONES.inicio, rota: PAINEIS[painel] };
  const senha: ItemMenuPainel = { label: 'Alterar minha senha', icone: ICONES.senha, rota: `${PAINEIS[painel]}/minha-senha`, grupo: 'Minha conta' };
  const telas = telasDoPainel(painel, pode)
    .filter((t) => !t.soAtalho)
    .map((t) => ({ label: t.label, icone: t.icone, rota: rotaDa(painel, t), funcionalidade: t.funcionalidade, grupo: t.grupo }));
  return [inicio, ...telas, senha];
}

// Botões do "Gestão Rápida" do Início (menu lateral + atalhos).
export function acoesRapidasDoPainel(painel: Painel, pode: (f: Funcionalidade) => boolean): AcaoRapida[] {
  return telasDoPainel(painel, pode).map((t) => ({ titulo: t.label, descricao: t.descricao, icone: t.icone, rota: rotaDa(painel, t) }));
}
