import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { ItemAgenda } from '../models/agenda-especialista.model';
import { FiltroMinhasTerapias } from '../models/terapia.model';
import { achatarTerapias } from '../../features/especialista/agenda/agenda.util';
import { TerapiaService } from './terapia';

const TAMANHO_PAGINA = 100; // máximo aceito pela API

// Agenda do ESPECIALISTA logado (o back identifica quem é pelo JWT).
@Injectable({ providedIn: 'root' })
export class AgendaEspecialistaService {
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
}
