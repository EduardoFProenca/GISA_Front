import { AcaoRapida } from '../../shared/components/painel-acoes/painel-acoes';
import { ICONES } from '../../shared/icons';

// Fonte única das ações da Recepção: usada pelo painel do dashboard e pelo menu lateral.
export const ACOES_RAPIDAS_RECEPCIONISTA: AcaoRapida[] = [
    { titulo: 'Registrar Presença', descricao: 'Presença ou ausência', iconeSvg: ICONES.gestaoConsultas, rota: '/recepcao/presenca' },
    { titulo: 'Controle de Agendamentos', descricao: 'Consultas e cancelamentos', iconeSvg: ICONES.calendario, rota: '/recepcao/agendamentos' },

    { titulo: 'Pacientes', descricao: 'Consultar e cadastrar pacientes', iconeSvg: ICONES.gestaoPacientes, rota: '/recepcao/pacientes' },
    //{ titulo: 'Emitir Recusa', descricao: 'Documento de recusa', iconeSvg: ICONES.cadastrarPaciente, rota: '/recepcao/recusa' },

];