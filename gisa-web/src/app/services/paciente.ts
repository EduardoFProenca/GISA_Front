import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PacienteResumo } from '../core/models/paciente-resumo.model';
import { PaginaSpring } from '../core/models/profissional-resumo.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pacientes`;

  // ATENÇÃO: endpoint assumido (GET /pacientes paginado, igual ao de /profissionais).
  listar(): Observable<PacienteResumo[]> {
    const params = new HttpParams().set('page', 0).set('size', 1000);
    return this.http
      .get<PaginaSpring<PacienteResumo>>(this.base, { params })
      .pipe(map((pagina) => pagina.content));
  }
}