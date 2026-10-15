import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AtualizacaoPacientePayload,
  CadastroPacienteResponse,
  InativacaoPacienteResponse,
  Paciente,
  PacienteCadastroPayload,
  PacienteResumo,
  ResponsavelPayload,
} from '../models/paciente.model';
import { Pagina, PaginaApi, normalizarPagina } from '../models/comum.model';
import { EventoPaciente, FiltroHistoricoPaciente } from '../models/historico.model';
import { montarParams } from './params.util';
import { comCarregamento } from '../http/carregamento';

// Não existe listagem de pacientes (LGPD): só busca, até 20 resultados, por nome.
export interface FiltroPacientes {
  // Só dígitos (máscara ignorada): CPF exato, 11 dígitos. Outro texto: trecho do nome, ao menos 3 letras.
  // Obrigatório, exceto com idEscola.
  termo?: string;
  // Pacientes de uma escola (gestão de escolas).
  idEscola?: number;
}

// Termo aceito pela busca: CPF completo ou nome com ao menos 3 caracteres.
export function termoBuscaPacienteValido(termo: string): boolean {
  const t = termo.trim();
  if (/^[\d.\-\s]+$/.test(t)) return t.replace(/\D/g, '').length === 11;
  return t.length >= 3;
}

// Pacientes (ver PACIENTES.md).
@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pacientes`;

  // Quem só vê os pacientes vinculados (assistente social) recebe só os dele (filtro do back).
  pesquisar(filtro: FiltroPacientes): Observable<PacienteResumo[]> {
    const termo = filtro.termo?.trim();
    const params = montarParams({
      idEscola: filtro.idEscola,
      termo: termo && /^[\d.\-\s]+$/.test(termo) ? termo.replace(/\D/g, '') : termo,
    });
    return this.http.get<PacienteResumo[]>(this.base, { params });
  }

  buscar(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.base}/${id}`, { context: comCarregamento() });
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

  // Inativa (statusCadastro INATIVO; statusPaciente DESLIGADO, salvo se estiver em ALTA). Cancela as
  // terapias individuais futuras e tira o paciente das coletivas futuras; devolve as quantidades.
  inativar(id: number): Observable<InativacaoPacienteResponse> {
    return this.http.delete<InativacaoPacienteResponse>(`${this.base}/${id}`);
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
