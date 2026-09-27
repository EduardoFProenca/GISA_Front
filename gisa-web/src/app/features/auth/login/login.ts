import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../core/auth/auth';

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
  mostrarSenha: boolean = false;
  erroUsuario: boolean = false;
  erroSenha: boolean = false;
  erroLogin: string = '';
  carregando: boolean = false;

  auth = inject(Auth);

  constructor(private router: Router) { }

  fazerLogin() {
    const usuarioValido = this.validarCampo(this.usuario, 3);
    const senhaValida = this.validarCampo(this.senha, 8);

    if (!usuarioValido) this.mostrarErro('usuario');
    if (!senhaValida) this.mostrarErro('senha');

    if (!usuarioValido || !senhaValida) return;

    this.erroLogin = '';
    this.carregando = true;

    this.auth.login({ cpf: this.usuario, senha: this.senha }).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/administrador']);
      },
      error: (err) => {
        this.carregando = false;
        this.erroLogin = err?.error?.message || 'CPF ou senha inválidos.';
      }
    });
  }

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  esqueciSenha() {
  }

  private validarCampo(valor: string, tamanhoMinimo: number): boolean {
    const semEspacos = valor.replace(/\s+/g, '');
    return semEspacos.length >= tamanhoMinimo;
  }

  private mostrarErro(campo: 'usuario' | 'senha') {
    if (campo === 'usuario') this.erroUsuario = true;
    else this.erroSenha = true;

    setTimeout(() => {
      if (campo === 'usuario') this.erroUsuario = false;
      else this.erroSenha = false;
    }, 1000);
  }
}