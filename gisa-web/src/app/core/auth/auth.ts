import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'gisa_token';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);

  usuarioAtual = signal<Usuario | null>(null);

  login(credenciais: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciais)
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
        })
      );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.usuarioAtual.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setUsuarioAtual(usuario: Usuario) {
    this.usuarioAtual.set(usuario);
  }
}
