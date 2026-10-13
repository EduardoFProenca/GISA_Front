import { AcaoRapida } from '../../shared/components/painel-acoes/painel-acoes';
import { ICONES } from '../../shared/icons';

// Fonte única das ações da Recepção: usada pelo painel do dashboard e pelo menu lateral.
export const ACOES_RAPIDAS_RECEPCIONISTA: AcaoRapida[] = [
  { titulo: 'Terapias do Dia', descricao: 'Registrar presença ou falta', iconeSvg: ICONES.gestaoConsultas, rota: '/recepcao/presenca' },
  { titulo: 'Controle de Agendamentos', descricao: 'Agendar, remarcar e cancelar', iconeSvg: ICONES.calendario, rota: '/recepcao/terapias' },
  { titulo: 'Pacientes', descricao: 'Consultar e cadastrar pacientes', iconeSvg: ICONES.gestaoPacientes, rota: '/recepcao/pacientes' },
];
