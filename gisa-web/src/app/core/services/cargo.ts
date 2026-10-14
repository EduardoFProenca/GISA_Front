import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AtualizacaoCargoPayload,
  AtualizacaoCboPayload,
  Cargo,
  CargoDetalhe,
  Cbo,
  CboDetalhe,
  FiltroCbos,
  NovoCargoPayload,
  NovoCboPayload,
} from '../models/cargo.model';
import { Pagina, PaginaApi, normalizarPagina } from '../models/comum.model';
import { montarParams } from './params.util';

// Cargos e CBOs (ver CARGOS.md). Os DELETE excluem de fato e só valem sem vínculos.
@Injectable({ providedIn: 'root' })
export class CargoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cargos`;
  private baseCbos = `${environment.apiUrl}/cbos`;

  // ---------- Cargos (sem paginação, ordenados por nome) ----------

  listar(nome?: string): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(this.base, { params: montarParams({ nome }) });
  }

  buscar(id: number): Observable<CargoDetalhe> {
    return this.http.get<CargoDetalhe>(`${this.base}/${id}`);
  }

  criar(dados: NovoCargoPayload): Observable<Cargo> {
    return this.http.post<Cargo>(this.base, dados);
  }

  // A mudança vale para todos os profissionais do cargo.
  atualizar(id: number, dados: AtualizacaoCargoPayload): Observable<CargoDetalhe> {
    return this.http.patch<CargoDetalhe>(`${this.base}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // ---------- CBOs (paginado: a tabela oficial tem milhares de códigos) ----------

  listarCbos(filtro: FiltroCbos = {}): Observable<Pagina<Cbo>> {
    return this.http
      .get<PaginaApi<Cbo>>(this.baseCbos, { params: montarParams({ ...filtro }) })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  buscarCbo(codigo: string): Observable<CboDetalhe> {
    return this.http.get<CboDetalhe>(`${this.baseCbos}/${encodeURIComponent(codigo)}`);
  }

  criarCbo(dados: NovoCboPayload): Observable<Cbo> {
    return this.http.post<Cbo>(this.baseCbos, dados);
  }

  // O código não pode ser alterado: só o título.
  atualizarCbo(codigo: string, dados: AtualizacaoCboPayload): Observable<Cbo> {
    return this.http.patch<Cbo>(`${this.baseCbos}/${encodeURIComponent(codigo)}`, dados);
  }

  excluirCbo(codigo: string): Observable<void> {
    return this.http.delete<void>(`${this.baseCbos}/${encodeURIComponent(codigo)}`);
  }
}
