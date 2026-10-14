import { AcaoRapida } from '../../shared/components/painel-acoes/painel-acoes';
import { ICONES } from '../../shared/icons';

// Ações rápidas do dashboard da Recepção (o menu lateral fica em core/layout/menus.ts).
export const ACOES_RAPIDAS_RECEPCIONISTA: AcaoRapida[] = [
  { titulo: 'Terapias do Dia', descricao: 'Registrar presença ou falta', icone: ICONES.gestaoConsultas, rota: '/recepcao/presenca' },
  { titulo: 'Controle de Agendamentos', descricao: 'Agendar, remarcar e cancelar', icone: ICONES.calendario, rota: '/recepcao/terapias' },
  { titulo: 'Pacientes', descricao: 'Consultar e atualizar pacientes', icone: ICONES.gestaoPacientes, rota: '/recepcao/pacientes' },
  { titulo: 'Emitir Recusa', descricao: 'Declaração de recusa de atendimento', icone: ICONES.recusa, rota: '/recepcao/recusa' },
];
