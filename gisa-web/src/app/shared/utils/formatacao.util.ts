import { soDigitos } from './texto.util';

// A API devolve CPF, celular e CEP só com dígitos; estas funções só formatam para exibir.
export function formatarCpf(valor: string | null | undefined): string {
  const d = soDigitos(valor);
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : (valor ?? '');
}

export function formatarCelular(valor: string | null | undefined): string {
  const d = soDigitos(valor);
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return valor ?? '';
}

export function formatarCep(valor: string | null | undefined): string {
  const d = soDigitos(valor);
  return d.length === 8 ? d.replace(/(\d{5})(\d{3})/, '$1-$2') : (valor ?? '');
}
