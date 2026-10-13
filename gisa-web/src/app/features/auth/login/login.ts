import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TimeoutError, timeout } from 'rxjs';
import { Auth } from '../../../core/auth/auth';

// Render (plano gratuito) pode levar quase 1 minuto para acordar na primeira chamada.
const TEMPO_LIMITE_MS = 60_000;
const AVISO_DEMORA_MS = 5_000;

// TEMPORÁRIO: true = depois do login abre a tela de escolha de portal.
// Mude para false para voltar a ir direto ao /administrador.
const ESCOLHER_PORTAL_APOS_LOGIN = true;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  usuario: string = '';
  senha: string = '';

  // Estado da tela em signals: atualiza mesmo em callbacks assíncronos (HTTP, setTimeout).
  mostrarSenha = signal(false);
  erroUsuario = signal(false);
  erroSenha = signal(false);
  erroLogin = signal('');
  carregando = signal(false);
  demorando = signal(false);

  auth = inject(Auth);

  constructor(private router: Router) { }

  fazerLogin() {
    const usuarioValido = this.validarCampo(this.usuario, 3);
    const senhaValida = this.validarCampo(this.senha, 8);

    if (!usuarioValido) this.mostrarErro('usuario');
    if (!senhaValida) this.mostrarErro('senha');

    if (!usuarioValido || !senhaValida) return;

    this.erroLogin.set('');
    this.carregando.set(true);
    this.demorando.set(false);

    const aviso = setTimeout(() => this.demorando.set(true), AVISO_DEMORA_MS);

    this.auth
      .login({ cpf: this.usuario, senha: this.senha })
      .pipe(timeout(TEMPO_LIMITE_MS))
      .subscribe({
        next: () => {
          clearTimeout(aviso);
          this.finalizarCarregamento();
          this.router.navigate([ESCOLHER_PORTAL_APOS_LOGIN ? '/portais' : '/administrador']);
        },
        error: (err: unknown) => {
          clearTimeout(aviso);
          this.finalizarCarregamento();
          this.erroLogin.set(this.mensagemDeErro(err));
        }
      });
  }

  toggleSenha() {
    this.mostrarSenha.update((v) => !v);
  }

  esqueciSenha() {
  }

  private finalizarCarregamento() {
    this.carregando.set(false);
    this.demorando.set(false);
  }

  private mensagemDeErro(err: unknown): string {
    if (err instanceof TimeoutError) {
      return 'O servidor demorou para responder. Tente novamente em instantes.';
    }

    const http = err as HttpErrorResponse;

    // status 0: a requisição nem chegou (offline, CORS ou bloqueador do navegador)
    if (http?.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua internet ou se algum bloqueador do navegador está ativo.';
    }
    if (http?.status >= 500) {
      return 'Erro no servidor. Tente novamente em instantes.';
    }
    return http?.error?.message || 'CPF ou senha inválidos.';
  }

  private validarCampo(valor: string, tamanhoMinimo: number): boolean {
    const semEspacos = valor.replace(/\s+/g, '');
    return semEspacos.length >= tamanhoMinimo;
  }

  private mostrarErro(campo: 'usuario' | 'senha') {
    const sinal = campo === 'usuario' ? this.erroUsuario : this.erroSenha;
    sinal.set(true);
    setTimeout(() => sinal.set(false), 1000);
  }
}