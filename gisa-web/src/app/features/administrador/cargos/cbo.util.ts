import { Cbo, FiltroCbos } from '../../../core/models/cargo.model';

export function apenasDigitos(texto: string): string {
  return (texto ?? '').replace(/\D/g, '');
}

// '251510' -> '2515-10' (formato usual do CBO; a API recebe sem máscara).
export function formatarCodigoCbo(codigo: string): string {
  const d = apenasDigitos(codigo);
  return d.length === 6 ? `${d.slice(0, 4)}-${d.slice(4)}` : codigo;
}

export function rotuloCbo(cbo: Cbo): string {
  return `${formatarCodigoCbo(cbo.codigoCBO)} · ${cbo.tituloCBO}`;
}

// Busca única: só números (com ou sem máscara) = início do código; qualquer letra = trecho do título.
export function filtroDeBuscaCbo(termo: string): Pick<FiltroCbos, 'codigo' | 'titulo'> {
  const limpo = (termo ?? '').trim();
  if (!limpo) return {};
  return /[^\d\s.-]/.test(limpo) ? { titulo: limpo } : { codigo: apenasDigitos(limpo) };
}
