// Itens do menu lateral (☰) de cada painel. Fonte única: o layout filtra pelos acessos do
// usuário logado (funcionalidade, ver permissoes.ts) e sempre começa por "Início".
import { ICONES } from '../../shared/icons';
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

const MENUS: Record<Painel, ItemMenuPainel[]> = {
  ADMINISTRADOR: [
    { label: 'Pacientes', icone: ICONES.gestaoPacientes, rota: '/administrador/pacientes', funcionalidade: 'VISUALIZAR_PACIENTES', grupo: 'Atendimento' },
    { label: 'Terapias', icone: ICONES.gestaoConsultas, rota: '/administrador/terapias', funcionalidade: 'VISUALIZAR_TERAPIAS', grupo: 'Atendimento' },
    { label: 'Profissionais', icone: ICONES.gestaoProfissionais, rota: '/administrador/profissionais/gerenciar', funcionalidade: 'VISUALIZAR_PROFISSIONAIS', grupo: 'Equipe' },
    { label: 'Cargos', icone: ICONES.cargo, rota: '/administrador/cargos', funcionalidade: 'GERENCIAR_CARGOS', grupo: 'Configurações' },
    { label: 'CBOs', icone: ICONES.lista, rota: '/administrador/cbos', funcionalidade: 'GERENCIAR_CARGOS', grupo: 'Configurações' },
    { label: 'Perfis de Acesso', icone: ICONES.chave, rota: '/administrador/perfis', funcionalidade: 'GERENCIAR_PERFIS', grupo: 'Configurações' },
    { label: 'Emitir Recusa', icone: ICONES.recusa, rota: '/administrador/recusa', funcionalidade: 'EMITIR_RECUSA', grupo: 'Documentos' },
  ],
  RECEPCAO: [
    { label: 'Terapias do Dia', icone: ICONES.gestaoConsultas, rota: '/recepcao/presenca', funcionalidade: 'VISUALIZAR_TERAPIAS' },
    { label: 'Agendamentos', icone: ICONES.calendario, rota: '/recepcao/terapias', funcionalidade: 'VISUALIZAR_TERAPIAS' },
    { label: 'Pacientes', icone: ICONES.gestaoPacientes, rota: '/recepcao/pacientes', funcionalidade: 'VISUALIZAR_PACIENTES' },
    { label: 'Emitir Recusa', icone: ICONES.recusa, rota: '/recepcao/recusa', funcionalidade: 'EMITIR_RECUSA' },
  ],
  ESPECIALISTA: [
    { label: 'Minha Agenda', icone: ICONES.calendario, rota: '/especialista/agenda', funcionalidade: 'VISUALIZAR_TERAPIAS' },
    { label: 'Minhas Terapias do Dia', icone: ICONES.gestaoConsultas, rota: '/especialista/minhas-terapias', funcionalidade: 'VISUALIZAR_TERAPIAS' },
    { label: 'Todas as Terapias', icone: ICONES.gestaoAtividades, rota: '/especialista/terapias', funcionalidade: 'VISUALIZAR_TERAPIAS' },
    { label: 'Emitir Atestado', icone: ICONES.atestado, rota: '/especialista/atestado', funcionalidade: 'EMITIR_ATESTADO' },
    { label: 'Emitir Receita', icone: ICONES.receita, rota: '/especialista/receita', funcionalidade: 'EMITIR_RECEITA' },
  ],
  ASSISTENTE_SOCIAL: [
    { label: 'Pacientes', icone: ICONES.gestaoPacientes, rota: '/assistente-social/pacientes', funcionalidade: 'VISUALIZAR_PACIENTES' },
  ],
};

// Itens do painel que o usuário pode acessar, com "Início" na frente.
export function itensDoMenu(painel: Painel, pode: (f: Funcionalidade) => boolean): ItemMenuPainel[] {
  const inicio: ItemMenuPainel = { label: 'Início', icone: ICONES.inicio, rota: PAINEIS[painel] };
  return [inicio, ...MENUS[painel].filter((item) => !item.funcionalidade || pode(item.funcionalidade))];
}
