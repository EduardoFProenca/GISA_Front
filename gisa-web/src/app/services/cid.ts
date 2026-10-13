import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Cid } from '../core/models/cid.model';
import { CID10 } from '../core/data/cid10';

// CID que já está na lista do formulário. `novo` = ainda não existe na base do GISA
// e deve ir em `novosCids` no POST /pacientes (se false, vai em `codigosCid`).
export interface CidSelecionado extends Cid {
  novo: boolean;
}

export type ResultadoCid =
  | { tipo: 'existente'; cid: Cid }
  | { tipo: 'novo'; cid: Cid }
  | { tipo: 'invalido' };

// Segue o fluxo da PACIENTES-ESCOLAS-CIDS-API.md (seção 3.2):
// 1) GET /cids/{codigo} na API do GISA -> 200: já existe;
// 2) 404 -> consulta a fonte pública de CID (ainda "a definir") -> descrição vira `novosCids`;
// 3) não achou em lugar nenhum -> código inválido.
@Injectable({ providedIn: 'root' })
export class CidService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cids`;

  // Sugestões para o dropdown (lista local, sem chamada à API).
  sugestoes(): Cid[] {
    return CID10;
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
        erro.status === 404 ? this.buscarNaFontePublica(codigo) : throwError(() => erro)
      )
    );
  }

  // PONTO DE TROCA: hoje usa a lista local (core/data/cid10.ts).
  // Quando a API pública for escolhida, chamar ela aqui.
  // ATENÇÃO: o authInterceptor coloca o token do GISA em TODA requisição; para a API
  // pública é preciso pular o token (ex.: ignorar URLs que não começam com environment.apiUrl).
  private buscarNaFontePublica(codigo: string): Observable<ResultadoCid> {
    const achado = CID10.find((c) => c.codigoCID === codigo);
    return of<ResultadoCid>(achado ? { tipo: 'novo', cid: { ...achado } } : { tipo: 'invalido' });
  }
}
