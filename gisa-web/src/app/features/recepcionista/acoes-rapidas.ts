import { AcaoRapida } from '../../shared/components/painel-acoes/painel-acoes';
import { ICONES } from '../../shared/icons';

// Fonte única das ações da Recepção: usada pelo painel do dashboard e pelo menu lateral.
export const ACOES_RAPIDAS_RECEPCIONISTA: AcaoRapida[] = [
    { titulo: 'Registrar Presença', descricao: 'Presença ou ausência', iconeSvg: ICONES.gestaoConsultas, rota: '/recepcionista/presenca' },
    { titulo: 'Controle de Agendamentos', descricao: 'Consultas e cancelamentos', iconeSvg: ICONES.calendario, rota: '/recepcionista/agendamentos' },

    //{ titulo: 'Gerenciar Paciente', descricao: 'Registro e triagem', iconeSvg: ICONES.gestaoPacientes, rota: '/recepcionista/pacientes' },
    //{ titulo: 'Emitir Recusa', descricao: 'Documento de recusa', iconeSvg: ICONES.cadastrarPaciente, rota: '/recepcionista/recusa' },

];