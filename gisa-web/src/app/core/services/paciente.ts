import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AtualizacaoPacientePayload,
  CadastroPacienteResponse,
  Paciente,
  PacienteCadastroPayload,
  PacienteResumo,
  ResponsavelPayload,
} from '../models/paciente.model';
import { Pagina, PaginaApi, ParametrosPagina, normalizarPagina } from '../models/comum.model';
import { EventoPaciente, FiltroHistoricoPaciente } from '../models/historico.model';
import { montarParams } from './params.util';

export interface FiltroPacientes extends ParametrosPagina {
  // Trecho do CPF (máscara ignorada) e/ou do nome; com os dois, o paciente precisa atender aos dois.
  cpf?: string;
  nome?: string;
}

// Pacientes (ver PACIENTES.md).
@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pacientes`;

  listar(filtro: FiltroPacientes = {}): Observable<Pagina<PacienteResumo>> {
    const params = montarParams({ sort: 'nome,asc', ...filtro });
    return this.http
      .get<PaginaApi<PacienteResumo>>(this.base, { params })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  buscar(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.base}/${id}`);
  }

  cadastrar(dados: PacienteCadastroPayload): Observable<CadastroPacienteResponse> {
    return this.http.post<CadastroPacienteResponse>(this.base, dados);
  }

  // Envie só o que mudar; listas substituem as atuais. Devolve o detalhe atualizado.
  atualizar(id: number, dados: AtualizacaoPacientePayload): Observable<Paciente> {
    return this.http.patch<Paciente>(`${this.base}/${id}`, dados);
  }

  // Cadastra (ou reaproveita pelo CPF) um responsável e o vincula. Devolve o detalhe atualizado.
  adicionarResponsavel(id: number, responsavel: ResponsavelPayload): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.base}/${id}/responsaveis`, responsavel);
  }

  // Inativa (statusCadastro INATIVO; statusPaciente DESLIGADO, salvo se estiver em ALTA).
  inativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  reativar(id: number): Observable<Paciente> {
    return this.atualizar(id, { statusCadastro: 'ATIVO', statusPaciente: 'MATRICULADO' });
  }

  historico(id: number, filtro: FiltroHistoricoPaciente = {}): Observable<Pagina<EventoPaciente>> {
    return this.http
      .get<PaginaApi<EventoPaciente>>(`${this.base}/${id}/historico`, { params: montarParams({ ...filtro }) })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }
}
