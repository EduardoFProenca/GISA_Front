import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AtualizacaoResponsavelPayload, Responsavel, ResponsavelResumo } from '../models/paciente.model';
import { Pagina, PaginaApi, ParametrosPagina, normalizarPagina } from '../models/comum.model';
import { montarParams } from './params.util';

export interface FiltroResponsaveis extends ParametrosPagina {
  // Trecho do CPF (máscara ignorada) e/ou do nome; com os dois, o responsável precisa atender aos dois.
  cpf?: string;
  nome?: string;
}

// Responsáveis (ver PACIENTES.md). O vínculo e o grau de parentesco mudam no PATCH do paciente.
@Injectable({ providedIn: 'root' })
export class ResponsavelService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/responsaveis`;

  listar(filtro: FiltroResponsaveis = {}): Observable<Pagina<ResponsavelResumo>> {
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
