// Itens do menu lateral (☰) de cada painel. Fonte única: o layout filtra pelos acessos do
// usuário logado (funcionalidade, ver permissoes.ts) e sempre começa por "Início".
import { ICONES } from '../../shared/icons';
import { Funcionalidade, Painel, PAINEIS } from '../auth/permissoes';

export const ICONE_INICIO = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>`;
const ICONE_CHAVE = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8"/><path d="m17 6 3 3"/><path d="m15 8 2 2"/></svg>`;
const ICONE_MALETA = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>`;
const ICONE_LISTA = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>`;
const ICONE_DOCUMENTO = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>`;

export interface ItemMenuPainel {
  label: string;
  iconeSvg: string;
  rota: string;
  // Sem funcionalidade = visível para qualquer usuário do painel.
  funcionalidade?: Funcionalidade;
  // Título da seção onde o item aparece (itens seguidos com o mesmo grupo ficam juntos).
  grupo?: string;
}

const MENUS: Record<Painel, ItemMenuPainel[]> = {
  ADMINISTRADOR: [
    { label: 'Pacientes', iconeSvg: ICONES.gestaoPacientes, rota: '/administrador/pacientes', funcionalidade: 'VISUALIZAR_PACIENTES', grupo: 'Atendimento' },
    { label: 'Terapias', iconeSvg: ICONES.gestaoConsultas, rota: '/administrador/terapias', funcionalidade: 'VISUALIZAR_TERAPIAS', grupo: 'Atendimento' },
    { label: 'Profissionais', iconeSvg: ICONES.gestaoProfissionais, rota: '/administrador/profissionais/gerenciar', funcionalidade: 'VISUALIZAR_PROFISSIONAIS', grupo: 'Equipe' },
    { label: 'Cargos', iconeSvg: ICONE_MALETA, rota: '/administrador/cargos', funcionalidade: 'GERENCIAR_CARGOS', grupo: 'Configurações' },
    { label: 'CBOs', iconeSvg: ICONE_LISTA, rota: '/administrador/cbos', funcionalidade: 'GERENCIAR_CARGOS', grupo: 'Configurações' },
    { label: 'Perfis de Acesso', iconeSvg: ICONE_CHAVE, rota: '/administrador/perfis', funcionalidade: 'GERENCIAR_PERFIS', grupo: 'Configurações' },
  ],
  RECEPCAO: [
    { label: 'Terapias do Dia', iconeSvg: ICONES.gestaoConsultas, rota: '/recepcao/presenca', funcionalidade: 'VISUALIZAR_TERAPIAS' },
    { label: 'Agendamentos', iconeSvg: ICONES.calendario, rota: '/recepcao/terapias', funcionalidade: 'VISUALIZAR_TERAPIAS' },
    { label: 'Pacientes', iconeSvg: ICONES.gestaoPacientes, rota: '/recepcao/pacientes', funcionalidade: 'VISUALIZAR_PACIENTES' },
    { label: 'Emitir Recusa', iconeSvg: ICONE_DOCUMENTO, rota: '/recepcao/recusa', funcionalidade: 'EMITIR_RECUSA' },
  ],
  ESPECIALISTA: [
    { label: 'Minha Agenda', iconeSvg: ICONES.calendario, rota: '/especialista/agenda', funcionalidade: 'VISUALIZAR_TERAPIAS' },
    { label: 'Minhas Terapias do Dia', iconeSvg: ICONES.gestaoConsultas, rota: '/especialista/minhas-terapias', funcionalidade: 'VISUALIZAR_TERAPIAS' },
    { label: 'Todas as Terapias', iconeSvg: ICONES.gestaoAtividades, rota: '/especialista/terapias', funcionalidade: 'VISUALIZAR_TERAPIAS' },
  ],
  ASSISTENTE_SOCIAL: [
    { label: 'Pacientes', iconeSvg: ICONES.gestaoPacientes, rota: '/assistente-social/pacientes', funcionalidade: 'VISUALIZAR_PACIENTES' },
  ],
};

// Itens do painel que o usuário pode acessar, com "Início" na frente.
export function itensDoMenu(painel: Painel, pode: (f: Funcionalidade) => boolean): ItemMenuPainel[] {
  const inicio: ItemMenuPainel = { label: 'Início', iconeSvg: ICONE_INICIO, rota: PAINEIS[painel] };
  return [inicio, ...MENUS[painel].filter((item) => !item.funcionalidade || pode(item.funcionalidade))];
}
