import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ConsultaDiaria,
  PacienteConsulta,
  RegistrarPresencaRequest,
} from '../core/models/consulta-diaria.model';

@Injectable({ providedIn: 'root' })
export class PresencaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/terapias`;

  // ATENÇÃO: endpoints assumidos (TODO(Kauã)):
  // GET   /terapias/diarias?data=yyyy-MM-dd
  // PATCH /terapias/{idTerapia}/pacientes/{idPaciente}/presenca

  // data no formato yyyy-MM-dd
  listarDoDia(data: string): Observable<ConsultaDiaria[]> {
    const params = new HttpParams().set('data', data);
    return this.http.get<ConsultaDiaria[]>(`${this.base}/diarias`, { params });
  }

  registrar(
    idTerapia: number,
    idPaciente: number,
    dados: RegistrarPresencaRequest
  ): Observable<PacienteConsulta> {
    return this.http.patch<PacienteConsulta>(
      `${this.base}/${idTerapia}/pacientes/${idPaciente}/presenca`,
      dados
    );
  }
}