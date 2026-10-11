import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PacienteLista, PacienteResumo } from '../core/models/paciente-resumo.model';
import { PaginaApi, PaginaSpring, normalizarPagina } from '../core/models/profissional-resumo.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pacientes`;

  // GET /api/pacientes (paginado, 0-indexed).
  listar(): Observable<PacienteResumo[]> {
    const params = new HttpParams().set('page', 0).set('size', 1000);
    return this.http
      .get<PaginaApi<PacienteResumo>>(this.base, { params })
      .pipe(map((pagina) => normalizarPagina(pagina).content));
  }

  listarPaginado(pagina: number, tamanho: number): Observable<PaginaSpring<PacienteLista>> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('size', tamanho)
      .set('sort', 'nome,asc');
    return this.http
      .get<PaginaApi<PacienteLista>>(this.base, { params })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }
}