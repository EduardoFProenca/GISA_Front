import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NovaTerapia, Terapia } from '../models/consulta.model';

@Injectable({ providedIn: 'root' })
export class TerapiaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/terapias`;

  // ATENÇÃO: endpoint assumido (POST /terapias).
  criar(dados: NovaTerapia): Observable<Terapia> {
    return this.http.post<Terapia>(this.base, dados);
  }
}