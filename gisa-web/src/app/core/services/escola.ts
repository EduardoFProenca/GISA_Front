import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AtualizacaoEscolaPayload, Escola, EscolaDetalhe, FiltroEscolas, NovaEscolaPayload } from '../models/escola.model';
import { Pagina, PaginaApi, normalizarPagina } from '../models/comum.model';
import { montarParams } from './params.util';
import { comCarregamento } from '../http/carregamento';

// Escolas (ver ESCOLAS.md). O autocomplete e o cadastro rápido servem ao formulário do paciente
// (quem cadastra/edita pacientes); listagem, detalhe, edição e exclusão são da gestão (GERENCIAR_ESCOLAS).
@Injectable({ providedIn: 'root' })
export class EscolaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/escolas`;

  // Autocomplete: até 10 resultados em ordem alfabética; sem nome, as 10 primeiras.
  buscarPorNome(nome: string): Observable<Escola[]> {
    return this.http.get<Escola[]>(`${this.base}/sugestoes`, { params: montarParams({ nome }) });
  }

  cadastrar(dados: NovaEscolaPayload): Observable<Escola> {
    return this.http.post<Escola>(this.base, dados);
  }

  // ---------- Gestão de escolas ----------

  // Padrão da API: 9 por página, por nome.
  listar(filtro: FiltroEscolas = {}): Observable<Pagina<EscolaDetalhe>> {
    return this.http
      .get<PaginaApi<EscolaDetalhe>>(this.base, { params: montarParams({ ...filtro }) })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  buscar(id: number): Observable<EscolaDetalhe> {
    return this.http.get<EscolaDetalhe>(`${this.base}/${id}`, { context: comCarregamento() });
  }

  atualizar(id: number, dados: AtualizacaoEscolaPayload): Observable<EscolaDetalhe> {
    return this.http.patch<EscolaDetalhe>(`${this.base}/${id}`, dados);
  }

  // Exclui de fato; só sem pacientes vinculados (inativos também contam).
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
