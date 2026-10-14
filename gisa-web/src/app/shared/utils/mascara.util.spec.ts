import { aplicarMascara, posicaoAposDigitos } from './mascara.util';

describe('aplicarMascara', () => {
  it('CPF completo e parcial', () => {
    expect(aplicarMascara('cpf', '12345678901')).toBe('123.456.789-01');
    expect(aplicarMascara('cpf', '1234')).toBe('123.4');
    expect(aplicarMascara('cpf', '123')).toBe('123');
  });

  it('ignora o que não é dígito e corta o excesso', () => {
    expect(aplicarMascara('cpf', 'a1b2c3.456.789-01999')).toBe('123.456.789-01');
  });

  it('CNPJ', () => {
    expect(aplicarMascara('cnpj', '12345678000195')).toBe('12.345.678/0001-95');
  });

  it('CEP', () => {
    expect(aplicarMascara('cep', '18010000')).toBe('18010-000');
    expect(aplicarMascara('cep', '1801')).toBe('1801');
  });

  it('celular com 11 dígitos e telefone fixo com 10', () => {
    expect(aplicarMascara('celular', '15999990000')).toBe('(15) 99999-0000');
    expect(aplicarMascara('celular', '1533330000')).toBe('(15) 3333-0000');
    expect(aplicarMascara('celular', '15')).toBe('(15');
    expect(aplicarMascara('celular', '159')).toBe('(15) 9');
  });

  it('vazio continua vazio', () => {
    expect(aplicarMascara('cpf', '')).toBe('');
    expect(aplicarMascara('celular', null)).toBe('');
  });
});

describe('posicaoAposDigitos', () => {
  it('pula os separadores', () => {
    expect(posicaoAposDigitos('123.456.789-01', 4)).toBe(5);
    expect(posicaoAposDigitos('123.456.789-01', 3)).toBe(3);
    expect(posicaoAposDigitos('123.456.789-01', 0)).toBe(0);
  });
});
