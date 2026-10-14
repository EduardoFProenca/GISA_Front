import { soDigitos } from './texto.util';

// Máscaras dos campos digitáveis. O valor guardado no formulário fica formatado;
// os payloads removem a formatação (soDigitos) antes de enviar para a API.
export type TipoMascara = 'cpf' | 'cnpj' | 'celular' | 'cep';

const MAXIMO_DIGITOS: Record<TipoMascara, number> = { cpf: 11, cnpj: 14, celular: 11, cep: 8 };

// Formata o que já foi digitado, mesmo incompleto: '1234' -> '123.4'.
export function aplicarMascara(tipo: TipoMascara, valor: string | null | undefined): string {
  const d = soDigitos(valor).slice(0, MAXIMO_DIGITOS[tipo]);
  switch (tipo) {
    case 'cpf':
      return montar(d, [3, 3, 3, 2], ['', '.', '.', '-']);
    case 'cnpj':
      return montar(d, [2, 3, 3, 4, 2], ['', '.', '.', '/', '-']);
    case 'cep':
      return montar(d, [5, 3], ['', '-']);
    case 'celular': {
      if (!d) return '';
      if (d.length <= 2) return `(${d}`;
      // Fixo (10 dígitos): (00) 0000-0000; celular (11): (00) 00000-0000.
      const meio = d.length <= 10 ? 4 : 5;
      return `(${d.slice(0, 2)}) ` + montar(d.slice(2), [meio, 4], ['', '-']);
    }
  }
}

// Junta os blocos de dígitos com os separadores, só até onde já há dígitos.
function montar(digitos: string, blocos: number[], separadores: string[]): string {
  let resultado = '';
  let pos = 0;
  blocos.forEach((tamanho, i) => {
    if (pos >= digitos.length) return;
    resultado += separadores[i] + digitos.slice(pos, pos + tamanho);
    pos += tamanho;
  });
  return resultado;
}

// Posição no texto formatado logo depois do N-ésimo dígito (para manter o cursor ao reformatar).
export function posicaoAposDigitos(formatado: string, quantidadeDigitos: number): number {
  if (quantidadeDigitos <= 0) return 0;
  let vistos = 0;
  for (let i = 0; i < formatado.length; i++) {
    if (/\d/.test(formatado[i]) && ++vistos === quantidadeDigitos) return i + 1;
  }
  return formatado.length;
}
