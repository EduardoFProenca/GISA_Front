import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Cid } from '../models/cid.model';

// CID que já está na lista do formulário. `novo` = ainda não existe na base do GISA
// e deve ir em `novosCids` no POST e no PATCH /pacientes (se false, vai em `codigosCid`).
export interface CidSelecionado extends Cid {
  novo: boolean;
}

export type ResultadoCid =
  | { tipo: 'existente'; cid: Cid }
  | { tipo: 'novo'; cid: Cid }
  | { tipo: 'invalido' };

// Tabela oficial do CID-10 (DATASUS, versão 2008), servida pelo próprio front em public/data.
// Gerada por scripts/gerar-cid10.mjs. Formato: { fonte, total, cids: [codigo, descricao][] }.
const ARQUIVO_CID10 = 'data/cid10.json';

interface ArquivoCid10 {
  cids: [string, string][];
}

// Segue o fluxo do CIDS.md:
// 1) GET /cids/{codigo} na API do GISA -> 200: já existe;
// 2) 404 -> procura na tabela oficial do DATASUS -> a descrição oficial vai em `novosCids`;
// 3) não achou em lugar nenhum -> código inválido.
@Injectable({ providedIn: 'root' })
export class CidService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cids`;

  // ~14 mil códigos (~1 MB, ~155 KB comprimido): baixado uma vez, só quando algum campo de CID é usado.
  // URL relativa ao app: não passa pelo token nem pelo loading (ambos só valem para a API).
  private catalogo$?: Observable<Cid[]>;

  catalogo(): Observable<Cid[]> {
    this.catalogo$ ??= this.http.get<ArquivoCid10>(ARQUIVO_CID10).pipe(
      map((arquivo) => arquivo.cids.map(([codigoCID, descricao]) => ({ codigoCID, descricao }))),
      // Se falhar, a próxima chamada tenta de novo em vez de repetir o erro do cache.
      catchError((erro) => {
        this.catalogo$ = undefined;
        return throwError(() => erro);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.catalogo$;
  }

  // A API compara o código exatamente como recebido: padronizamos sempre.
  padronizar(codigo: string): string {
    return codigo.replace(/\s/g, '').toUpperCase();
  }

  resolver(codigoDigitado: string): Observable<ResultadoCid> {
    const codigo = this.padronizar(codigoDigitado);
    return this.http.get<Cid>(`${this.base}/${encodeURIComponent(codigo)}`).pipe(
      map((cid): ResultadoCid => ({ tipo: 'existente', cid })),
      catchError((erro: HttpErrorResponse) =>
        erro.status === 404 ? this.buscarNaTabelaOficial(codigo) : throwError(() => erro)
      )
    );
  }

  // PONTO DE TROCA: quando o back tiver uma busca de CIDs, ela pode substituir a tabela local.
  private buscarNaTabelaOficial(codigo: string): Observable<ResultadoCid> {
    return this.catalogo().pipe(
      map((lista): ResultadoCid => {
        const achado = lista.find((c) => c.codigoCID === codigo);
        return achado ? { tipo: 'novo', cid: { ...achado } } : { tipo: 'invalido' };
      })
    );
  }
}
