import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RedefinirSenhaPayload, TokenResponse, UsuarioLogado } from '../models/auth.model';
import { CadastroExigido, Funcionalidade, podeAcessar, temCadastro } from './permissoes';

const TOKEN_KEY = 'gisa_token';
const USUARIO_KEY = 'gisa_usuario';

export type ResultadoLogin =
  | { primeiroAcesso: false; usuario: UsuarioLogado }
  | { primeiroAcesso: true; tokenRedefinicao: string };

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

  // Tipo de cadastro do usuário logado (ver temCadastro em permissoes.ts).
  ehEspecialista = computed(() => temCadastro(this.usuarioAtual()?.tipoCadastro, 'ESPECIALISTA'));
  ehAssistenteSocial = computed(() => temCadastro(this.usuarioAtual()?.tipoCadastro, 'ASSISTENTE_SOCIAL'));

  // POST /auth/login e, em seguida, GET /usuarios/me. Com a senha temporária (primeiro acesso) não há
  // sessão: devolve o token de redefinição para a tela de cadastrar a senha definitiva.
  login(credenciais: LoginRequest): Observable<ResultadoLogin> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciais).pipe(
      switchMap((res): Observable<ResultadoLogin> => {
        if (res.senhaTemporaria || !res.token) {
          return of({ primeiroAcesso: true, tokenRedefinicao: res.tokenRedefinicao ?? '' });
        }
        this.substituirToken(res.token);
        return this.carregarUsuario().pipe(map((usuario) => ({ primeiroAcesso: false as const, usuario })));
      })
    );
  }

  // Sempre 204, exista o e-mail ou não (a API não revela quais e-mails estão cadastrados).
  esqueciSenha(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/esqueci-senha`, { email });
  }

  // Primeiro acesso ou "esqueci minha senha": a resposta já é o token de login, então entra direto.
  redefinirSenha(dados: RedefinirSenhaPayload): Observable<UsuarioLogado> {
    return this.http.post<TokenResponse>(`${environment.apiUrl}/auth/redefinir-senha`, dados).pipe(
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

  temCadastro(exigido: CadastroExigido): boolean {
    return temCadastro(this.usuarioAtual()?.tipoCadastro, exigido);
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
