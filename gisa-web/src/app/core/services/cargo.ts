import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cargo } from '../models/cargo.model';

@Injectable({ providedIn: 'root' })
export class CargoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cargos`;

  listar(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(this.base);
  }
}
