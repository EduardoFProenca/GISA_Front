import { filtrarTexto } from './filtro-texto.util';

describe('filtrarTexto', () => {
  it('nome aceita letras com acento, espaço, apóstrofo e hífen', () => {
    expect(filtrarTexto('nome', "Ana-Clara D'Ávila")).toBe("Ana-Clara D'Ávila");
    expect(filtrarTexto('nome', 'João@ 123 Silva!')).toBe('João  Silva');
  });

  it('texto aceita números e pontuação comum, mas não símbolos', () => {
    expect(filtrarTexto('texto', 'E.E. Professor Nº 2 (Centro), Bloco A/B')).toBe('E.E. Professor Nº 2 (Centro), Bloco A/B');
    expect(filtrarTexto('texto', 'Recepção#$%*!?<>')).toBe('Recepção');
  });

  it('registro aceita sigla, número, hífen e barra', () => {
    expect(filtrarTexto('registro', 'CRESS-9/12345')).toBe('CRESS-9/12345');
    expect(filtrarTexto('registro', 'CRP#06@123')).toBe('CRP06123');
  });

  it('numero só mantém dígitos', () => {
    expect(filtrarTexto('numero', '12a3-4 ')).toBe('1234');
    expect(filtrarTexto('numero', null)).toBe('');
  });
});
