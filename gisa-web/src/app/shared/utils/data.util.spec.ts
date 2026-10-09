import { deIso, paraIso, somarDias } from './data.util';

describe('data.util', () => {
  it('formata data local como yyyy-MM-dd', () => {
    expect(paraIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('converte de e para ISO sem deslocar o dia', () => {
    expect(paraIso(deIso('2026-10-09'))).toBe('2026-10-09');
  });

  it('soma dias atravessando o mês', () => {
    expect(somarDias('2026-10-31', 1)).toBe('2026-11-01');
    expect(somarDias('2026-03-01', -1)).toBe('2026-02-28');
  });
});