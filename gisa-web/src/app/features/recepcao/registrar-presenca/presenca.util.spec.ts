import { ConsultaDiaria, StatusPresenca } from '../../../core/models/consulta-diaria.model';
import { Modalidade, StatusTerapia } from '../../../core/models/consulta.model';
import {
  atualizarPaciente,
  calcularResumo,
  consultaLiberada,
  filtrarConsultas,
  filtrarPorSituacao,
  situacaoDaConsulta,
} from './presenca.util';

function consulta(id: number, status: StatusTerapia, presencas: (StatusPresenca | null)[]): ConsultaDiaria {
  return {
    idTerapia: id,
    dataHoraInicio: '2026-10-09T09:00:00',
    dataHoraFim: '2026-10-09T09:50:00',
    modalidade: Modalidade.COLETIVA,
    status,
    especialistas: [{ idEspecialista: 10, nome: 'Dra. Ana Souza' }],
    pacientes: presencas.map((presenca, i) => ({
      idPaciente: id * 100 + i,
      nome: `Paciente ${id}-${i}`,
      presenca,
      justificativa: null,
    })),
  };
}

describe('presenca.util', () => {
  const lista = [
    consulta(1, StatusTerapia.AGENDADA, [StatusPresenca.PRESENTE, null, StatusPresenca.FALTA_JUSTIFICADA]),
    consulta(2, StatusTerapia.CANCELADA, [null, null]),
  ];

  it('calcula o resumo ignorando consultas canceladas', () => {
    expect(calcularResumo(lista)).toEqual({ consultas: 2, presentes: 1, faltas: 1, pendentes: 1 });
  });

  it('filtra por paciente ou especialista', () => {
    expect(filtrarConsultas(lista, 'paciente 2-1').length).toBe(1);
    expect(filtrarConsultas(lista, 'ana').length).toBe(2);
    expect(filtrarConsultas(lista, 'xyz').length).toBe(0);
    expect(filtrarConsultas(lista, '  ').length).toBe(2);
  });

  it('atualiza só o paciente indicado, sem mutar o original', () => {
    const alvo = lista[0].pacientes[1];
    const novo = atualizarPaciente(lista, 1, { ...alvo, presenca: StatusPresenca.PRESENTE });

    expect(novo[0].pacientes[1].presenca).toBe(StatusPresenca.PRESENTE);
    expect(lista[0].pacientes[1].presenca).toBe(null);
    expect(novo[1]).toBe(lista[1]);
  });

  describe('consultaLiberada', () => {
    it('é true quando todos os pacientes têm presença registrada', () => {
      const c = consulta(3, StatusTerapia.AGENDADA, [StatusPresenca.PRESENTE, StatusPresenca.FALTA_INJUSTIFICADA]);
      expect(consultaLiberada(c)).toBe(true);
    });

    it('é false quando ainda há paciente pendente', () => {
      expect(consultaLiberada(lista[0])).toBe(false);
    });

    it('é false para consulta cancelada ou sem pacientes', () => {
      const cancelada = consulta(4, StatusTerapia.CANCELADA, [StatusPresenca.PRESENTE]);
      const vazia = consulta(5, StatusTerapia.AGENDADA, []);
      expect(consultaLiberada(cancelada)).toBe(false);
      expect(consultaLiberada(vazia)).toBe(false);
    });
  });

  describe('situacaoDaConsulta', () => {
    it('classifica em PENDENTE, LIBERADA e CANCELADA', () => {
      expect(situacaoDaConsulta(lista[0])).toBe('PENDENTE');
      expect(situacaoDaConsulta(lista[1])).toBe('CANCELADA');
     
      expect(situacaoDaConsulta(consulta(7, StatusTerapia.AGENDADA, [StatusPresenca.PRESENTE]))).toBe('LIBERADA');
    });
  });

  describe('filtrarPorSituacao', () => {
    const liberada = consulta(6, StatusTerapia.AGENDADA, [StatusPresenca.PRESENTE]);
    const todas = [...lista, liberada];

    it('conjunto vazio devolve tudo', () => {
      expect(filtrarPorSituacao(todas, new Set()).length).toBe(3);
    });

    it('LIBERADA devolve só as liberadas', () => {
      expect(filtrarPorSituacao(todas, new Set(['LIBERADA']))).toEqual([liberada]);
    });

    it('PENDENTE devolve só as pendentes', () => {
      expect(filtrarPorSituacao(todas, new Set(['PENDENTE']))).toEqual([lista[0]]);
    });

    it('aceita várias situações ao mesmo tempo', () => {
      expect(filtrarPorSituacao(todas, new Set(['LIBERADA', 'CANCELADA']))).toEqual([lista[1], liberada]);
    });
  });
});