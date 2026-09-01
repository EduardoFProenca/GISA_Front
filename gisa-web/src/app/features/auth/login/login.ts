import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) { }

  fazerLogin() {
    const usuarioValido = this.validarCampo(this.usuario, 3);
    const senhaValida = this.validarCampo(this.senha, 8);

    if (!usuarioValido) this.mostrarErro('usuario');
    if (!senhaValida) this.mostrarErro('senha');

    if (!usuarioValido || !senhaValida) return; // para aqui se algum falhar

    // ... segue com o login normalmente
  }


  mostrarSenha: boolean = false;

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  esqueciSenha() {

  }


  erroUsuario: boolean = false;
  erroSenha: boolean = false;

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