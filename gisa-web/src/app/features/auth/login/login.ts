import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { ICONES } from '../../../shared/icons';
import { Router, RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
import { Auth } from '../../../core/auth/auth';
import { motivoSemPainel } from '../../../core/auth/permissoes';
import { lerErroApi, mensagemDeErro } from '../../../core/http/erro-api';
import { emailValido } from '../../../shared/utils/texto.util';
import { ESTADO_PRIMEIRO_ACESSO } from '../redefinir-senha/redefinir-senha';

// Render (plano gratuito) pode levar quase 1 minuto para acordar na primeira chamada.
const TEMPO_LIMITE_MS = 60_000;
const AVISO_DEMORA_MS = 5_000;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIcon, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  readonly icones = ICONES;
  email: string = '';
  senha: string = '';

  // Estado da tela em signals: atualiza mesmo em callbacks assíncronos (HTTP, setTimeout).
  mostrarSenha = signal(false);
  erroEmail = signal(false);
  erroSenha = signal(false);
  erroLogin = signal('');
  carregando = signal(false);
  demorando = signal(false);

  auth = inject(Auth);

  constructor(private router: Router) { }

  fazerLogin() {
    const emailOk = emailValido(this.email);
    const senhaValida = this.validarCampo(this.senha, 8);

    if (!emailOk) this.mostrarErro('email');
    if (!senhaValida) this.mostrarErro('senha');

    if (!emailOk || !senhaValida) return;

    this.erroLogin.set('');
    this.carregando.set(true);
    this.demorando.set(false);

    const aviso = setTimeout(() => this.demorando.set(true), AVISO_DEMORA_MS);

    this.auth
      .login({ email: this.email.trim(), senha: this.senha })
      .pipe(timeout(TEMPO_LIMITE_MS))
      .subscribe({
        next: (resultado) => {
          clearTimeout(aviso);
          this.finalizarCarregamento();
          // Senha temporária: cadastra a definitiva antes de entrar (o token vai no estado, fora da URL).
          if (resultado.primeiroAcesso) {
            this.router.navigate(['/redefinir-senha'], {
              state: { [ESTADO_PRIMEIRO_ACESSO]: resultado.tokenRedefinicao },
            });
            return;
          }
          const rota = this.auth.rotaInicial();
          if (rota) {
            this.router.navigate([rota]);
            return;
          }
          // Perfil sem painel (ou incompatível com o cadastro): ver core/auth/permissoes.ts.
          this.auth.logout();
          this.erroLogin.set(motivoSemPainel(resultado.usuario));
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

  private finalizarCarregamento() {
    this.carregando.set(false);
    this.demorando.set(false);
  }

  private mensagemDeErro(err: unknown): string {
    // No login, 401 é e-mail/senha errados, cadastro inativo ou senha temporária vencida (a API explica).
    if (err instanceof HttpErrorResponse && err.status === 401) {
      return lerErroApi(err)?.message || 'E-mail ou senha inválidos.';
    }
    return mensagemDeErro(err, 'E-mail ou senha inválidos.');
  }

  private validarCampo(valor: string, tamanhoMinimo: number): boolean {
    const semEspacos = valor.replace(/\s+/g, '');
    return semEspacos.length >= tamanhoMinimo;
  }

  private mostrarErro(campo: 'email' | 'senha') {
    const sinal = campo === 'email' ? this.erroEmail : this.erroSenha;
    sinal.set(true);
    setTimeout(() => sinal.set(false), 1000);
  }
}
