// Caracteres aceitos em cada tipo de campo digitável (o resto é descartado enquanto digita/cola).
// - nome: nomes de pessoa, cidade, ocupação — só letras (com acento), espaço, apóstrofo e hífen.
// - texto: nomes de cadastro, endereço, razão social — letras, números e pontuação comum.
// - registro: registro em conselho (CRP-12345, CRESS-9/12345) — letras, números, ponto, hífen e barra.
// - numero: só dígitos.
export type TipoFiltro = 'nome' | 'texto' | 'registro' | 'numero';

const INVALIDOS: Record<TipoFiltro, RegExp> = {
  nome: /[^\p{L} '\-]/gu,
  texto: /[^\p{L}\p{N} .,\-\/()'&ºª]/gu,
  registro: /[^\p{L}\p{N} .\-\/]/gu,
  numero: /\D/g,
};

export function filtrarTexto(tipo: TipoFiltro, valor: string | null | undefined): string {
  return (valor ?? '').replace(INVALIDOS[tipo], '');
}
