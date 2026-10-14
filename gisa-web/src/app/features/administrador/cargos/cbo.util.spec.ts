import { filtroDeBuscaCbo, formatarCodigoCbo, rotuloCbo } from './cbo.util';

describe('cbo.util', () => {
  it('formata o código com a máscara usual', () => {
    expect(formatarCodigoCbo('251510')).toBe('2515-10');
    expect(formatarCodigoCbo('2515')).toBe('2515');
  });

  it('monta o rótulo com código e título', () => {
    expect(rotuloCbo({ codigoCBO: '251510', tituloCBO: 'Psicólogo clínico' })).toBe('2515-10 · Psicólogo clínico');
  });

  it('busca por código quando só há números (máscara ignorada)', () => {
    expect(filtroDeBuscaCbo('2515-1')).toEqual({ codigo: '25151' });
    expect(filtroDeBuscaCbo(' 4221 ')).toEqual({ codigo: '4221' });
  });

  it('busca por título quando há letras', () => {
    expect(filtroDeBuscaCbo('psic')).toEqual({ titulo: 'psic' });
  });

  it('sem termo, sem filtro', () => {
    expect(filtroDeBuscaCbo('   ')).toEqual({});
  });
});
