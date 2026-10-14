import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { soDigitos } from '../../shared/utils/texto.util';

// Ocupação da tabela oficial da CBO 2002 (Ministério do Trabalho).
export interface OcupacaoCbo {
  codigoCBO: string;
  tituloCBO: string;
}

// Servida pelo próprio front em public/data, gerada por scripts/gerar-cbo.mjs.
// Formato: { fonte, total, ocupacoes: [codigo, titulo][] }.
const ARQUIVO_CBO = 'data/cbo2002.json';

interface ArquivoCbo {
  ocupacoes: [string, string][];
}

const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Consulta à tabela oficial: completa o título ao cadastrar um CBO na API do GISA e sugere
// ocupações que ainda não foram cadastradas. Não existe API pública oficial da CBO.
@Injectable({ providedIn: 'root' })
export class CboCatalogoService {
  private http = inject(HttpClient);

  // ~2,7 mil ocupações (~125 KB): baixado uma vez, só quando alguma tela de CBO é usada.
  private catalogo$?: Observable<Map<string, OcupacaoCbo>>;

  catalogo(): Observable<Map<string, OcupacaoCbo>> {
    this.catalogo$ ??= this.http.get<ArquivoCbo>(ARQUIVO_CBO).pipe(
      map((arquivo) => new Map(arquivo.ocupacoes.map(([codigoCBO, tituloCBO]) => [codigoCBO, { codigoCBO, tituloCBO }]))),
      // Se falhar, a próxima chamada tenta de novo em vez de repetir o erro do cache.
      catchError((erro) => {
        this.catalogo$ = undefined;
        return throwError(() => erro);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.catalogo$;
  }

  // Só números = início do código; com letras = trecho do título (sem acento/maiúsculas).
  buscar(catalogo: Map<string, OcupacaoCbo>, termo: string, limite = 5): OcupacaoCbo[] {
    const limpo = termo.trim();
    if (!limpo) return [];
    const porCodigo = !/[^\d\s.-]/.test(limpo);
    const alvo = porCodigo ? soDigitos(limpo) : normalizar(limpo);
    const achadas: OcupacaoCbo[] = [];
    for (const o of catalogo.values()) {
      if (porCodigo ? o.codigoCBO.startsWith(alvo) : normalizar(o.tituloCBO).includes(alvo)) achadas.push(o);
      if (achadas.length >= limite) break;
    }
    return achadas;
  }
}
