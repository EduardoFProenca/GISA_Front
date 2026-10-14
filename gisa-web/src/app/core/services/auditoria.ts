import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FiltroAuditoria, RegistroAuditoria } from '../models/auditoria.model';
import { Pagina, PaginaApi, normalizarPagina } from '../models/comum.model';
import { montarParams } from './params.util';

// Trilha de auditoria (ver AUDITORIA.md). Só para quem tem ACESSO_TOTAL.
// Cada consulta aqui também vira um registro CONSULTA na própria auditoria.
@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auditoria`;

  // Padrão da API: 20 por página, mais recentes primeiro.
  listar(filtro: FiltroAuditoria = {}): Observable<Pagina<RegistroAuditoria>> {
    return this.http
      .get<PaginaApi<RegistroAuditoria>>(this.base, { params: montarParams({ ...filtro }) })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }
}
