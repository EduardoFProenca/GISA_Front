import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemAgenda } from '../models/agenda-especialista.model';
import {
  SolicitacaoRemarcacao,
  SolicitacaoRemarcacaoPayload,
} from '../models/remarcacao.model';
import { FiltroMinhasTerapias } from '../models/terapia.model';
import { achatarTerapias } from '../../features/especialista/agenda/agenda.util';
import { montarParams } from './params.util';
import { TerapiaService } from './terapia';

const TAMANHO_PAGINA = 100; // máximo aceito pela API

// Agenda do ESPECIALISTA logado (o back identifica quem é pelo JWT) e solicitações de remarcação.
@Injectable({ providedIn: 'root' })
export class AgendaEspecialistaService {
  private http = inject(HttpClient);
  private terapias = inject(TerapiaService);

  // GET /terapias/minhas (existe na API). Busca todas as páginas do intervalo (yyyy-MM-dd, dias incluídos).
  listarPeriodo(inicio: string, fim: string): Observable<ItemAgenda[]> {
    const filtro: FiltroMinhasTerapias = { inicio, fim, size: TAMANHO_PAGINA, sort: 'dataHoraInicio,asc' };

    return this.terapias.minhas({ ...filtro, page: 0 }).pipe(
      switchMap((primeira) => {
        if (primeira.totalPages <= 1) return of(primeira.content);
        const demais = Array.from({ length: primeira.totalPages - 1 }, (_, i) =>
          this.terapias.minhas({ ...filtro, page: i + 1 }).pipe(map((p) => p.content))
        );
        return forkJoin(demais).pipe(map((paginas) => [...primeira.content, ...paginas.flat()]));
      }),
      map(achatarTerapias)
    );
  }

  // ATENÇÃO: endpoint PROPOSTO, ainda não existe na API-GISA:
  //   POST /api/terapias/{idTerapia}/remarcacoes  -> cria com status PENDENTE (Secretaria/Coordenação avalia).
  solicitarRemarcacao(idTerapia: number, dados: SolicitacaoRemarcacaoPayload): Observable<SolicitacaoRemarcacao> {
    return this.http.post<SolicitacaoRemarcacao>(`${environment.apiUrl}/terapias/${idTerapia}/remarcacoes`, dados);
  }

  // ATENÇÃO: endpoint PROPOSTO, ainda não existe: GET /api/remarcacoes?minhas=true
  // (solicitações do especialista logado, mais recentes primeiro; array ou página).
  listarSolicitacoes(): Observable<SolicitacaoRemarcacao[]> {
    return this.http
      .get<SolicitacaoRemarcacao[] | { content: SolicitacaoRemarcacao[] }>(`${environment.apiUrl}/remarcacoes`, {
        params: montarParams({ minhas: true }),
      })
      .pipe(map((r) => (Array.isArray(r) ? r : (r.content ?? []))));
  }
}
