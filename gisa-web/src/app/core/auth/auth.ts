import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'gisa_token';
const USUARIO_KEY = 'gisa_usuario';

// Lê o payload (claims) de um JWT sem validar a assinatura (quem valida é a API).
export function decodificarToken(token: string): Record<string, unknown> | null {
  try {
    const parte = token.split('.')[1];
    if (!parte) return null;
    const base64 = parte
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parte.length / 4) * 4, '=');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function texto(valor: unknown): string | null {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  usuarioAtual = signal<Usuario | null>(this.lerUsuarioSalvo());

  login(credenciais: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciais)
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          this.setUsuarioAtual(this.montarUsuario(res));
        })
      );
  }

  logout() {
    this.limparSessao();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    if (this.tokenExpirado(token)) {
      this.limparSessao();
      return false;
    }
    return true;
  }

  setUsuarioAtual(usuario: Usuario | null) {
    this.usuarioAtual.set(usuario);
    try {
      if (usuario) localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
      else localStorage.removeItem(USUARIO_KEY);
    } catch {
      // armazenamento indisponível: o usuário só fica em memória
    }
  }

  private limparSessao() {
    localStorage.removeItem(TOKEN_KEY);
    this.setUsuarioAtual(null);
  }

  // TODO(Kauã): a resposta do login hoje só tem `token` e o JWT só tem o CPF (subject).
  // Quando a API enviar `nome` e `cargo` (na resposta ou nas claims), o header passa a exibi-los.
  private montarUsuario(res: LoginResponse): Usuario | null {
    const claims = decodificarToken(res.token) ?? {};
    const nome = texto(res['nome']) ?? texto(claims['nome']);
    const cargo =
      texto(res['cargo']) ?? texto(res['perfil']) ?? texto(claims['cargo']) ?? texto(claims['perfil']);
    return nome ? { nome, cargo: cargo ?? '' } : null;
  }

  private lerUsuarioSalvo(): Usuario | null {
    try {
      if (!this.isLoggedIn()) return null;
      const bruto = localStorage.getItem(USUARIO_KEY);
      return bruto ? (JSON.parse(bruto) as Usuario) : null;
    } catch {
      return null;
    }
  }

  private tokenExpirado(token: string): boolean {
    const exp = decodificarToken(token)?.['exp'];
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  }
}