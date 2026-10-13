import { Terapia, TerapiaDoEspecialista } from '../../../core/models/terapia.model';
import {
  calcularResumo,
  especialistasTexto,
  filtrarPorSituacao,
  filtrarTerapias,
  horarioTerapia,
  situacaoDaTerapia,
  substituirTerapia,
} from './presenca.util';

function terapia(parcial: Partial<Terapia> = {}): Terapia {
  return {
    idTerapia: 1,
    titulo: 'Lucas Santos',
    modalidade: 'INDIVIDUAL',
    data: '2026-10-13',
    horaInicio: '09:00',
    horaTermino: '09:50',
    status: 'AGENDADA',
    horarioLiberado: false,
    pacientes: [{ idCadastro: 5, nome: 'Lucas Santos', presenca: 'PENDENTE', justificativa: null }],
    especialistas: [{ idCadastro: 10, nome: 'Ana Souza', especialidades: ['Psicologia'] }],
    motivoCancelamento: null,
    ...parcial,
  };
}

describe('presenca.util', () => {
  it('resumo ignora pacientes de terapias canceladas', () => {
    const lista = [
      terapia(),
      terapia({ idTerapia: 2, pacientes: [{ idCadastro: 6, nome: 'Bia', presenca: 'PRESENTE', justificativa: null }] }),
      terapia({ idTerapia: 3, status: 'CANCELADA' }),
    ];
    expect(calcularResumo(lista)).toEqual({ terapias: 3, presentes: 1, faltas: 0, pendentes: 1 });
  });

  it('situação: pendente, registrada ou cancelada', () => {
    expect(situacaoDaTerapia(terapia())).toBe('PENDENTE');
    expect(
      situacaoDaTerapia(terapia({ pacientes: [{ idCadastro: 5, nome: 'L', presenca: 'FALTA_INJUSTIFICADA', justificativa: null }] }))
    ).toBe('REGISTRADA');
    expect(situacaoDaTerapia(terapia({ status: 'CANCELADA' }))).toBe('CANCELADA');
  });

  it('filtra por situação (vazio = tudo) e por nome de paciente ou especialista', () => {
    const lista = [terapia(), terapia({ idTerapia: 2, status: 'CANCELADA' })];
    expect(filtrarPorSituacao(lista, new Set()).length).toBe(2);
    expect(filtrarPorSituacao(lista, new Set(['CANCELADA'])).map((t) => t.idTerapia)).toEqual([2]);
    expect(filtrarTerapias(lista, 'ana').length).toBe(2);
    expect(filtrarTerapias(lista, 'ninguém').length).toBe(0);
  });

  it('formata horário e especialistas', () => {
    expect(horarioTerapia(terapia())).toBe('09:00 – 09:50');
    expect(especialistasTexto(terapia())).toBe('Ana Souza (Psicologia)');
    const minha: TerapiaDoEspecialista = { ...terapia(), outrosEspecialistas: [] } as unknown as TerapiaDoEspecialista;
    delete (minha as Partial<Terapia>).especialistas;
    expect(especialistasTexto(minha)).toBe('Atendimento individual do especialista');
  });

  it('substitui a terapia mantendo o formato de /minhas', () => {
    const minha = { ...terapia(), outrosEspecialistas: ['Carlos'] } as unknown as TerapiaDoEspecialista;
    delete (minha as Partial<Terapia>).especialistas;
    const atualizada = terapia({ horarioLiberado: true });

    const [resultado] = substituirTerapia([minha], atualizada);

    expect(resultado.horarioLiberado).toBe(true);
    expect('especialistas' in resultado).toBe(false);
    expect(resultado.outrosEspecialistas).toEqual(['Carlos']);
  });
});
