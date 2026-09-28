import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import {
  DadosBaseProfissional,
  DadosEspecialista,
  DadosEspecialistaPJ,
  ProfissionalComUsuario,
  EspecialistaComUsuario,
  EspecialistaPJComUsuario,
  CadastroResponse
} from '../core/models/profissional.model';
import { PaginaSpring, ProfissionalResumo } from '../core/models/profissional-resumo.model';

@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  listarPaginado(pagina: number, tamanho: number = 9): Observable<PaginaSpring<ProfissionalResumo>> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('size', tamanho);
    return this.http.get<PaginaSpring<ProfissionalResumo>>(`${this.base}/profissionais`, { params });
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

  listarEspecialistas(): Observable<ProfissionalResumo[]> {
  const params = new HttpParams().set('page', 0).set('size', 1000);
  return this.http
    .get<PaginaSpring<ProfissionalResumo>>(`${this.base}/profissionais`, { params })
    .pipe(map((p) => p.content.filter((x) => !!x.registroConselho && x.statusCadastro !== 'INATIVO')));
}
}