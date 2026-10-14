import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AlterarStatusTerapiaPayload,
  AtualizacaoTerapiaPayload,
  FiltroMinhasTerapias,
  FiltroTerapias,
  NovaTerapiaPayload,
  RegistroPresencaPayload,
  Terapia,
  TerapiaDoEspecialista,
  VerificacaoConflitos,
  VerificarConflitosPayload,
} from '../models/terapia.model';
import { Pagina, PaginaApi, normalizarPagina } from '../models/comum.model';
import { montarParams } from './params.util';
import { SEM_CARREGAMENTO } from '../http/carregamento';
import { comCarregamento } from '../http/carregamento';

// Terapias (ver TERAPIAS.md). "Consulta" nas telas antigas = Terapia.
@Injectable({ providedIn: 'root' })
export class TerapiaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/terapias`;

  // Padrão da API: 6 por página, mais recentes primeiro. size máximo 100.
  listar(filtro: FiltroTerapias = {}): Observable<Pagina<Terapia>> {
    return this.http
      .get<PaginaApi<Terapia>>(this.base, { params: montarParams({ ...filtro }) })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  // Terapias do especialista logado (400 se o usuário não for especialista).
  minhas(filtro: FiltroMinhasTerapias = {}): Observable<Pagina<TerapiaDoEspecialista>> {
    return this.http
      .get<PaginaApi<TerapiaDoEspecialista>>(`${this.base}/minhas`, { params: montarParams({ ...filtro }) })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  buscar(id: number): Observable<Terapia> {
    return this.http.get<Terapia>(`${this.base}/${id}`, { context: comCarregamento() });
  }

  criar(dados: NovaTerapiaPayload): Observable<Terapia> {
    return this.http.post<Terapia>(this.base, dados);
  }

  // Só terapias AGENDADA; listas substituem as atuais.
  atualizar(id: number, dados: AtualizacaoTerapiaPayload): Observable<Terapia> {
    return this.http.patch<Terapia>(`${this.base}/${id}`, dados);
  }

  // Aviso antecipado: não grava nem reserva o horário. Roda em segundo plano (sem loading global).
  verificarConflitos(dados: VerificarConflitosPayload): Observable<VerificacaoConflitos> {
    return this.http.post<VerificacaoConflitos>(`${this.base}/verificar-conflitos`, dados, {
      context: new HttpContext().set(SEM_CARREGAMENTO, true),
    });
  }

  alterarStatus(id: number, dados: AlterarStatusTerapiaPayload): Observable<Terapia> {
    return this.http.patch<Terapia>(`${this.base}/${id}/status`, dados);
  }

  // Devolve a terapia inteira atualizada (inclusive horarioLiberado).
  registrarPresenca(idTerapia: number, idPaciente: number, dados: RegistroPresencaPayload): Observable<Terapia> {
    return this.http.patch<Terapia>(`${this.base}/${idTerapia}/pacientes/${idPaciente}/presenca`, dados);
  }
}
