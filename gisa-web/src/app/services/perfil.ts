import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Perfil } from '../core/models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/perfis`;

  listar(): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(this.base);
  }
}
