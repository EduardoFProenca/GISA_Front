import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
import { Auth } from '../../../core/auth/auth';
import { motivoSemPainel } from '../../../core/auth/permissoes';
import { lerErroApi, mensagemDeErro } from '../../../core/http/erro-api';

// Render (plano gratuito) pode levar quase 1 minuto para acordar na primeira chamada.
const TEMPO_LIMITE_MS = 60_000;
const AVISO_DEMORA_MS = 5_000;

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
        next: (usuario) => {
          clearTimeout(aviso);
          this.finalizarCarregamento();
          const rota = this.auth.rotaInicial();
          if (rota) {
            this.router.navigate([rota]);
            return;
          }
          // Perfil sem painel (ou incompatível com o cadastro): ver core/auth/permissoes.ts.
          this.auth.logout();
          this.erroLogin.set(motivoSemPainel(usuario));
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
    // No login, 401 é CPF/senha errados ou cadastro inativo, não sessão expirada.
    if (err instanceof HttpErrorResponse && err.status === 401) {
      return lerErroApi(err)?.message || 'CPF ou senha inválidos.';
    }
    return mensagemDeErro(err, 'CPF ou senha inválidos.');
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