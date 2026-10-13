import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Escola, NovaEscolaPayload } from '../models/escola.model';

@Injectable({ providedIn: 'root' })
export class EscolaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/escolas`;

  // Autocomplete: no máximo 10 resultados, busca por trecho do nome.
  buscarPorNome(nome: string): Observable<Escola[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<Escola[]>(this.base, { params });
  }

  cadastrar(dados: NovaEscolaPayload): Observable<Escola> {
    return this.http.post<Escola>(this.base, dados);
  }
}
