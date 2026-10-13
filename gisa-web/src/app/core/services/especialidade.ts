import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especialidade } from '../models/especialidade.model';

@Injectable({ providedIn: 'root' })
export class EspecialidadeService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/especialidades`;

  listar(): Observable<Especialidade[]> {
    return this.http.get<Especialidade[]>(this.base);
  }
}
