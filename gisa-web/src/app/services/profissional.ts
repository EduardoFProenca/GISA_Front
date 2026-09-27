import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DadosBaseProfissional,
  DadosEspecialista,
  DadosEspecialistaPJ,
  ProfissionalComUsuario,
  EspecialistaComUsuario,
  EspecialistaPJComUsuario,
  CadastroResponse
} from '../core/models/profissional.model';

@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

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
}
