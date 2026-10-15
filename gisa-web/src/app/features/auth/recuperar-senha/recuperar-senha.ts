import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { emailValido } from '../../../shared/utils/texto.util';

// "Esqueci minha senha": a API manda um link de redefinição (60 min) para o e-mail, se ele for de um
// usuário ativo. A resposta é sempre a mesma, exista o e-mail ou não (não revela quem é cadastrado).
@Component({
  selector: 'app-recuperar-senha',
  imports: [FormsModule, RouterLink],
  styleUrls: ['../login/login.scss', './recuperar-senha.scss'],
  templateUrl: './recuperar-senha.html',
})
export class RecuperarSenha {
  private auth = inject(Auth);

  email = '';
  erroEmail = signal('');
  erro = signal('');
  enviando = signal(false);
  enviado = signal(false);

  enviar() {
    if (this.enviando()) return;
    this.erro.set('');
    this.erroEmail.set(emailValido(this.email) ? '' : 'Informe um e-mail válido.');
    if (this.erroEmail()) return;

    this.enviando.set(true);
    this.auth.esqueciSenha(this.email.trim()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
      },
      error: (err) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível enviar o pedido. Tente novamente.'));
      },
    });
  }
}
