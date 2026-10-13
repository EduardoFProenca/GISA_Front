import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioLogado } from '../models/auth.model';
import { Funcionalidade, PAINEIS, Painel, painelDoUsuario, podeAcessar } from './permissoes';

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

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  usuarioAtual = signal<UsuarioLogado | null>(this.lerUsuarioSalvo());

  // Nomes das permissões do usuário logado.
  permissoes = computed(() => this.usuarioAtual()?.permissoes.map((p) => p.nome) ?? []);

  painel = computed<Painel | null>(() => {
    const usuario = this.usuarioAtual();
    return usuario ? painelDoUsuario(usuario) : null;
  });

  // POST /auth/login e, em seguida, GET /usuarios/me.
  login(credenciais: LoginRequest): Observable<UsuarioLogado> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciais)
      .pipe(
        tap((res) => this.substituirToken(res.token)),
        switchMap(() => this.carregarUsuario())
      );
  }

  // Atualiza nome, perfil e permissões (ex.: ao abrir o app com uma sessão salva).
  carregarUsuario(): Observable<UsuarioLogado> {
    return this.http
      .get<UsuarioLogado>(`${environment.apiUrl}/usuarios/me`)
      .pipe(tap((usuario) => this.salvarUsuario(usuario)));
  }

  // A troca da própria senha devolve um token novo; o antigo deixa de valer.
  substituirToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
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

  temPermissao(funcionalidade: Funcionalidade): boolean {
    return podeAcessar(this.permissoes(), funcionalidade);
  }

  // Rota inicial do usuário logado (null = perfil sem painel).
  rotaInicial(): string | null {
    const painel = this.painel();
    return painel ? PAINEIS[painel] : null;
  }

  private salvarUsuario(usuario: UsuarioLogado | null) {
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
    this.salvarUsuario(null);
  }

  private lerUsuarioSalvo(): UsuarioLogado | null {
    try {
      // Roda na criação do signal: não pode chamar limparSessao() aqui.
      const token = this.getToken();
      if (!token || this.tokenExpirado(token)) return null;
      const bruto = localStorage.getItem(USUARIO_KEY);
      const usuario = bruto ? (JSON.parse(bruto) as UsuarioLogado) : null;
      // Formato antigo salvo antes do /usuarios/me: descarta.
      return usuario?.perfil && Array.isArray(usuario.permissoes) ? usuario : null;
    } catch {
      return null;
    }
  }

  private tokenExpirado(token: string): boolean {
    const exp = decodificarToken(token)?.['exp'];
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  }
}
