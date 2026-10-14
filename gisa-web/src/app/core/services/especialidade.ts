import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AtualizacaoEspecialidadePayload,
  Especialidade,
  EspecialidadeDetalhe,
  NovaEspecialidade,
} from '../models/especialidade.model';

// Especialidades (ver ESPECIALISTAS.md). A listagem é aberta a qualquer usuário logado;
// o resto exige GERENCIAR_ESPECIALIDADES.
@Injectable({ providedIn: 'root' })
export class EspecialidadeService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/especialidades`;

  // Todas, por nome (sem paginação).
  listar(): Observable<Especialidade[]> {
    return this.http.get<Especialidade[]>(this.base);
  }

  buscar(id: number): Observable<EspecialidadeDetalhe> {
    return this.http.get<EspecialidadeDetalhe>(`${this.base}/${id}`);
  }

  criar(dados: NovaEspecialidade): Observable<Especialidade> {
    return this.http.post<Especialidade>(this.base, dados);
  }

  atualizar(id: number, dados: AtualizacaoEspecialidadePayload): Observable<EspecialidadeDetalhe> {
    return this.http.patch<EspecialidadeDetalhe>(`${this.base}/${id}`, dados);
  }

  // Exclui de fato; só sem especialistas vinculados (inativos também contam).
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
