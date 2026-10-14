import { Cbo, FiltroCbos } from '../../../core/models/cargo.model';
import { formatarCbo } from '../../../shared/utils/formatacao.util';
import { soDigitos } from '../../../shared/utils/texto.util';

export function rotuloCbo(cbo: Cbo): string {
  return `${formatarCbo(cbo.codigoCBO)} · ${cbo.tituloCBO}`;
}

// Busca única: só números (com ou sem máscara) = início do código; qualquer letra = trecho do título.
export function filtroDeBuscaCbo(termo: string): Pick<FiltroCbos, 'codigo' | 'titulo'> {
  const limpo = (termo ?? '').trim();
  if (!limpo) return {};
  return /[^\d\s.-]/.test(limpo) ? { titulo: limpo } : { codigo: soDigitos(limpo) };
}
