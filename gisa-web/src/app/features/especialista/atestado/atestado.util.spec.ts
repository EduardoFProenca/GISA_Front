import {
  FormAtestado,
  calcularDataFim,
  calcularDias,
  numeroPorExtenso,
  textoAtestado,
  validarAtestado,
} from './atestado.util';

const base = (): FormAtestado => ({
  tipo: 'AFASTAMENTO',
  dias: 3,
  dataInicio: '2026-10-13',
  dataFim: '2026-10-15',
  codigoCid: null,
  autorizouCid: false,
  cpfResponsavel: '',
  observacoes: '',
});

describe('atestado.util', () => {
  it('calcula data final e quantidade de dias', () => {
    expect(calcularDataFim('2026-10-13', 3)).toBe('2026-10-15');
    expect(calcularDataFim('2026-10-13', 0)).toBe('');
    expect(calcularDias('2026-10-13', '2026-10-15')).toBe(3);
    expect(calcularDias('2026-10-15', '2026-10-13')).toBeNull();
  });

  it('valida campos obrigatórios e período', () => {
    expect(validarAtestado(base())).toEqual({});
    expect(validarAtestado({ ...base(), tipo: '' })['tipo']).toBeTruthy();
    expect(validarAtestado({ ...base(), dias: null })['dias']).toBeTruthy();
    expect(validarAtestado({ ...base(), dataFim: '2026-10-01' })['dataFim']).toBeTruthy();
  });

  it('exige autorização para constar o CID', () => {
    expect(validarAtestado({ ...base(), codigoCid: 'F70' })['autorizouCid']).toBeTruthy();
    expect(validarAtestado({ ...base(), codigoCid: 'F70', autorizouCid: true })).toEqual({});
  });

  it('comparecimento não exige dias', () => {
    expect(validarAtestado({ ...base(), tipo: 'COMPARECIMENTO', dias: null, dataFim: '' })).toEqual({});
  });

  it('acompanhamento exige o responsável', () => {
    expect(validarAtestado({ ...base(), tipo: 'ACOMPANHAMENTO' })['cpfResponsavel']).toBeTruthy();
  });

  it('escreve números por extenso', () => {
    expect([1, 15, 21, 100, 101, 250].map(numeroPorExtenso)).toEqual([
      'um', 'quinze', 'vinte e um', 'cem', 'cento e um', 'duzentos e cinquenta',
    ]);
  });

  it('gera o texto com CID só quando informado', () => {
    const dados = { form: base(), pacienteNome: 'Lucas', pacienteCpf: '52601815906', responsavel: null, cidTexto: null };
    const t = textoAtestado(dados).join(' ');
    expect(t).toContain('3 (três) dias');
    expect(t).not.toContain('CID-10');
    expect(textoAtestado({ ...dados, cidTexto: 'F70 — Retardo mental leve' }).join(' ')).toContain('CID-10: F70');
  });
});
