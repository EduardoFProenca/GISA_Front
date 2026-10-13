import { ItemAgenda } from '../../../core/models/agenda-especialista.model';
import { Presenca, StatusTerapia, TerapiaDoEspecialista } from '../../../core/models/terapia.model';
import {
  achatarTerapias,
  diasDaSemana,
  filtrarAgenda,
  montarGrade,
  proximoPaciente,
  resumoDoDia,
  statusAgenda,
} from './agenda.util';

function ag(hora: string, status: StatusTerapia, presenca: Presenca, nome = 'Ana'): ItemAgenda {
  return {
    idTerapia: Number(hora.replace(':', '')),
    idPaciente: 1,
    pacienteNome: nome,
    data: '2026-10-13',
    horaInicio: hora,
    horaTermino: `${hora.slice(0, 2)}:50`,
    modalidade: 'INDIVIDUAL',
    statusTerapia: status,
    presenca,
    outrosEspecialistas: [],
  };
}

describe('agenda.util (especialista)', () => {
  const lista = [
    ag('08:00', 'CONCLUIDA', 'PRESENTE'),
    ag('09:00', 'AGENDADA', 'PRESENTE'),
    ag('10:00', 'AGENDADA', 'FALTA_JUSTIFICADA'),
    ag('11:00', 'CANCELADA', 'PENDENTE'),
    ag('14:00', 'AGENDADA', 'PENDENTE', 'João'),
  ];

  it('combina status da terapia e presença', () => {
    expect(lista.map(statusAgenda)).toEqual(['CONCLUIDA', 'PRESENTE', 'FALTA_JUSTIFICADA', 'CANCELADA', 'AGENDADA']);
  });

  it('resume o dia ignorando cancelados', () => {
    expect(resumoDoDia(lista)).toEqual({ total: 4, atendidos: 1, aguardando: 1, faltas: 1 });
  });

  it('escolhe o próximo paciente ainda não atendido', () => {
    expect(proximoPaciente(lista, new Date(2026, 9, 13, 8, 30))?.horaInicio).toBe('09:00');
    expect(proximoPaciente(lista, new Date(2026, 9, 13, 13, 0))?.pacienteNome).toBe('João');
    expect(proximoPaciente(lista, new Date(2026, 9, 13, 18, 0))).toBeNull();
  });

  it('filtra por nome, status e modalidade', () => {
    expect(filtrarAgenda(lista, 'joao', '', '').length).toBe(1);
    expect(filtrarAgenda(lista, '', 'FALTA_JUSTIFICADA', '').length).toBe(1);
    expect(filtrarAgenda(lista, '', '', 'COLETIVA').length).toBe(0);
  });

  it('monta a grade com semanas completas começando no domingo', () => {
    const g = montarGrade(2026, 10);
    expect(g.dias.length % 7).toBe(0);
    expect(g.inicioIso).toBe('2026-09-27');
    expect(g.fimIso).toBe('2026-10-31');
    expect(g.dias.filter((d) => d.doMes).length).toBe(31);
  });

  it('lista os 7 dias da semana de uma data', () => {
    const s = diasDaSemana('2026-10-13');
    expect(s[0]).toBe('2026-10-11');
    expect(s[6]).toBe('2026-10-17');
  });

  it('transforma terapias da API em um item por paciente', () => {
    const t: TerapiaDoEspecialista = {
      idTerapia: 7, titulo: 'Terapia coletiva', modalidade: 'COLETIVA', data: '2026-10-13',
      horaInicio: '09:00:00', horaTermino: '10:00:00', status: 'AGENDADA', horarioLiberado: false,
      pacientes: [
        { idCadastro: 1, nome: 'A', presenca: 'PENDENTE', justificativa: null },
        { idCadastro: 2, nome: 'B', presenca: 'PRESENTE', justificativa: null },
      ],
      outrosEspecialistas: ['Carlos'],
    };
    const itens = achatarTerapias([t]);
    expect(itens.length).toBe(2);
    expect(itens[0].horaInicio).toBe('09:00');
    expect(itens[1].presenca).toBe('PRESENTE');
  });
});
