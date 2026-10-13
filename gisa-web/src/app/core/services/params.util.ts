import { HttpParams } from '@angular/common/http';

type Valor = string | number | boolean | null | undefined;

// Monta query params ignorando vazios. Listas viram parâmetros repetidos (?status=A&status=B).
export function montarParams(valores: Record<string, Valor | readonly Valor[]>): HttpParams {
  let params = new HttpParams();
  for (const [chave, valor] of Object.entries(valores)) {
    const lista = Array.isArray(valor) ? valor : [valor];
    for (const item of lista) {
      if (item === null || item === undefined || item === '') continue;
      params = params.append(chave, String(item));
    }
  }
  return params;
}
