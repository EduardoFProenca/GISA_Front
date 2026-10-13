import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DadosBaseProfissional,
  DadosEspecialista,
  DadosEspecialistaPJ,
  ProfissionalComUsuario,
  EspecialistaComUsuario,
  EspecialistaPJComUsuario,
  CadastroResponse,
  Especialista,
  EspecialistaPJ,
  Profissional,
  ProfissionalDetalhe,
  ProfissionalResumo,
} from '../models/profissional.model';
import { Pagina, PaginaApi, normalizarPagina } from '../models/comum.model';

@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  listarPaginado(pagina: number, tamanho: number = 9): Observable<Pagina<ProfissionalResumo>> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('size', tamanho);
    return this.http
      .get<PaginaApi<ProfissionalResumo>>(`${this.base}/profissionais`, { params })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  // GET /profissionais/{id}; depois tenta /especialistas/pj/{id} e /especialistas/{id}
  // (a API devolve 404 quando o profissional não é daquele tipo).
  buscarDetalhe(id: number): Observable<ProfissionalDetalhe> {
    return this.http.get<Profissional>(`${this.base}/profissionais/${id}`).pipe(
      switchMap((profissional) =>
        this.buscarEspecialista(id).pipe(map((extra) => ({ profissional, ...extra })))
      )
    );
  }

  private buscarEspecialista(
    id: number
  ): Observable<{ especialista: Especialista | null; pj: EspecialistaPJ | null }> {
    const naoEncontrado = (e: HttpErrorResponse) => e.status === 404;

    return this.http.get<EspecialistaPJ>(`${this.base}/especialistas/pj/${id}`).pipe(
      map((pj) => ({ especialista: pj.especialista, pj })),
      catchError((erroPJ: HttpErrorResponse) => {
        if (!naoEncontrado(erroPJ)) return throwError(() => erroPJ);
        return this.http.get<Especialista>(`${this.base}/especialistas/${id}`).pipe(
          map((especialista) => ({ especialista, pj: null })),
          catchError((erro: HttpErrorResponse) =>
            naoEncontrado(erro) ? of({ especialista: null, pj: null }) : throwError(() => erro)
          )
        );
      })
    );
  }

  cadastrarProfissional(dados: DadosBaseProfissional): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${this.base}/profissionais`, dados);
  }

  cadastrarProfissionalComUsuario(dados: ProfissionalComUsuario): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${this.base}/profissionais/com-usuario`, dados);
  }

  cadastrarEspecialista(dados: DadosEspecialista): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${this.base}/especialistas`, dados);
  }

  cadastrarEspecialistaComUsuario(dados: EspecialistaComUsuario): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${this.base}/especialistas/com-usuario`, dados);
  }

  cadastrarEspecialistaPJ(dados: DadosEspecialistaPJ): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${this.base}/especialistas/pj`, dados);
  }

  cadastrarEspecialistaPJComUsuario(dados: EspecialistaPJComUsuario): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(`${this.base}/especialistas/pj/com-usuario`, dados);
  }

  // Especialistas e PJ ativos (para escolher quem atende uma terapia).
  listarEspecialistas(): Observable<ProfissionalResumo[]> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000)
      .append('tipo', 'ESPECIALISTA')
      .append('tipo', 'ESPECIALISTA_PJ')
      .set('statusCadastro', 'ATIVO');
    return this.http
      .get<PaginaApi<ProfissionalResumo>>(`${this.base}/profissionais`, { params })
      .pipe(map((p) => p.content));
  }
}