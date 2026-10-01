import { describe, it, expect } from 'vitest';
import { soDigitos, vazio, emailValido } from './texto.util';

describe('texto.util', () => {
  describe('soDigitos', () => {
    it('remove tudo que não é dígito', () => {
      expect(soDigitos('123.456.789-01')).toBe('12345678901');
      expect(soDigitos('(11) 99999-9999')).toBe('11999999999');
    });

    it('retorna string vazia para null/undefined', () => {
      expect(soDigitos(null)).toBe('');
      expect(soDigitos(undefined)).toBe('');
    });
  });

  describe('vazio', () => {
    it('considera vazio: null, undefined e string só com espaços', () => {
      expect(vazio(null)).toBe(true);
      expect(vazio(undefined)).toBe(true);
      expect(vazio('   ')).toBe(true);
    });

    it('não considera vazio um valor com conteúdo real', () => {
      expect(vazio('Maria')).toBe(false);
      expect(vazio(0)).toBe(false);
    });
  });

  describe('emailValido', () => {
    it('aceita formatos comuns de e-mail', () => {
      expect(emailValido('maria@email.com')).toBe(true);
    });

    it('rejeita strings sem @ ou sem domínio', () => {
      expect(emailValido('maria-email.com')).toBe(false);
      expect(emailValido('maria@')).toBe(false);
    });
  });
});