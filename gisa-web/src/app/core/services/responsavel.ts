import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AtualizacaoResponsavelPayload, Responsavel, ResponsavelResumo } from '../models/paciente.model';
import { Pagina, PaginaApi, normalizarPagina } from '../models/comum.model';
import { FiltroPacientes } from './paciente';
import { montarParams } from './params.util';

// Responsáveis (ver PACIENTES.md). O vínculo e o grau de parentesco mudam no PATCH do paciente.
@Injectable({ providedIn: 'root' })
export class ResponsavelService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/responsaveis`;

  listar(filtro: FiltroPacientes = {}): Observable<Pagina<ResponsavelResumo>> {
    return this.http
      .get<PaginaApi<ResponsavelResumo>>(this.base, { params: montarParams({ ...filtro }) })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  buscar(id: number): Observable<Responsavel> {
    return this.http.get<Responsavel>(`${this.base}/${id}`);
  }

  atualizar(id: number, dados: AtualizacaoResponsavelPayload): Observable<Responsavel> {
    return this.http.patch<Responsavel>(`${this.base}/${id}`, dados);
  }

  // Inativa; o responsável continua vinculado aos pacientes.
  inativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
