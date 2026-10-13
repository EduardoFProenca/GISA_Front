import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EvolucaoPayload } from '../models/evolucao.model';

@Injectable({ providedIn: 'root' })
export class EvolucaoService {
  private http = inject(HttpClient);

  // ATENÇÃO: endpoint PROPOSTO, ainda não existe na API-GISA:
  //   POST /api/pacientes/{idPaciente}/evolucoes  (o back grava o autor pelo JWT e a data/hora).
  salvar(idPaciente: number, dados: EvolucaoPayload): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/pacientes/${idPaciente}/evolucoes`, dados);
  }
}
