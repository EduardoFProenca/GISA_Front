import { Terapia } from '../../../core/models/terapia.model';
import { calcularFrequenciaMes } from './frequencia.util';

const t = (id: number, presenca: 'PRESENTE' | 'PENDENTE' | 'FALTA_INJUSTIFICADA', status: Terapia['status'] = 'CONCLUIDA'): Terapia => ({
  idTerapia: id, titulo: 'X', modalidade: 'INDIVIDUAL', data: `2026-10-0${id}`, horaInicio: '09:00:00',
  horaTermino: '10:00:00', status, horarioLiberado: false,
  pacientes: [{ idCadastro: 5, nome: 'P', presenca, justificativa: null }],
  especialistas: [{ idCadastro: 1, nome: 'E', especialidades: ['Fonoaudiologia'] }],
});

describe('frequencia.util', () => {
  it('aplica a regra dos 75% ignorando pendentes e canceladas', () => {
    const f = calcularFrequenciaMes(
      [t(1, 'PRESENTE'), t(2, 'PRESENTE'), t(3, 'PRESENTE'), t(4, 'FALTA_INJUSTIFICADA'), t(5, 'PENDENTE', 'AGENDADA'), t(6, 'FALTA_INJUSTIFICADA', 'CANCELADA')],
      5
    );
    expect(f.geral.percentual).toBe(75);
    expect(f.geral.abaixoDoLimite).toBe(false);
    expect(f.porEspecialidade[0].rotulo).toBe('Fonoaudiologia');
    expect(f.sessoes.length).toBe(5);
  });

  it('marca abaixo do limite e trata mês sem registros', () => {
    expect(calcularFrequenciaMes([t(1, 'PRESENTE'), t(2, 'FALTA_INJUSTIFICADA')], 5).geral.abaixoDoLimite).toBe(true);
    expect(calcularFrequenciaMes([t(1, 'PENDENTE', 'AGENDADA')], 5).geral.percentual).toBeNull();
  });
});
