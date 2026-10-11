import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EscolaCadastrada, NovaEscolaPayload } from '../core/models/escola.model';

@Injectable({ providedIn: 'root' })
export class EscolaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/escolas`;

  // Autocomplete: no máximo 10 resultados, busca por trecho do nome.
  buscarPorNome(nome: string): Observable<EscolaCadastrada[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<EscolaCadastrada[]>(this.base, { params });
  }

  cadastrar(dados: NovaEscolaPayload): Observable<EscolaCadastrada> {
    return this.http.post<EscolaCadastrada>(this.base, dados);
  }
}
