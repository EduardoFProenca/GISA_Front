import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Auth } from '../../../core/auth/auth';
import { motivoSemPainel } from '../../../core/auth/permissoes';
import { aplicarErrosApi } from '../../../core/http/erro-api';
import { ICONES } from '../../../shared/icons';

// Chave do history.state com o tokenRedefinicao do login (primeiro acesso), para não pôr o token na URL.
export const ESTADO_PRIMEIRO_ACESSO = 'tokenPrimeiroAcesso';

// Cadastrar a nova senha. Dois caminhos, o mesmo endpoint (POST /auth/redefinir-senha):
// - primeiro acesso: o login com a senha temporária manda para cá com o token no estado da navegação;
// - "esqueci minha senha": o link do e-mail traz ?token=.
// A resposta já é o token de login: o usuário entra direto no painel.
@Component({
  selector: 'app-redefinir-senha',
  imports: [FormsModule, RouterLink, NgIcon],
  styleUrls: ['../login/login.scss', '../recuperar-senha/recuperar-senha.scss'],
  templateUrl: './redefinir-senha.html',
})
export class RedefinirSenha {
  private auth = inject(Auth);
  private router = inject(Router);
  readonly icones = ICONES;

  private readonly tokenPrimeiroAcesso: string | undefined = history.state?.[ESTADO_PRIMEIRO_ACESSO];
  readonly primeiroAcesso = !!this.tokenPrimeiroAcesso;
  readonly token = this.tokenPrimeiroAcesso || inject(ActivatedRoute).snapshot.queryParamMap.get('token') || '';

  novaSenha = '';
  confirmacao = '';
  mostrarSenha = signal(false);
  erros = signal<Record<string, string>>({});
  erro = signal('');
  // Link vencido, usado ou inválido: oferece pedir outro.
  erroToken = signal(false);
  salvando = signal(false);

  limparErro(campo: string) {
    this.erros.update(({ [campo]: _, ...resto }) => resto);
  }

  salvar() {
    if (this.salvando()) return;
    const erros: Record<string, string> = {};
    if (this.novaSenha.length < 8 || this.novaSenha.length > 30) erros['novaSenha'] = 'A senha deve ter de 8 a 30 caracteres.';
    if (this.confirmacao !== this.novaSenha) erros['confirmacaoNovaSenha'] = 'A confirmação não corresponde à nova senha.';
    this.erros.set(erros);
    this.erro.set('');
    this.erroToken.set(false);
    if (Object.keys(erros).length) return;

    this.salvando.set(true);
    this.auth
      .redefinirSenha({ token: this.token, novaSenha: this.novaSenha, confirmacaoNovaSenha: this.confirmacao })
      .subscribe({
        next: (usuario) => {
          this.salvando.set(false);
          const rota = this.auth.rotaInicial();
          if (rota) {
            this.router.navigate([rota], { replaceUrl: true });
            return;
          }
          this.auth.logout();
          this.erro.set(motivoSemPainel(usuario));
        },
        error: (err) => {
          this.salvando.set(false);
          const doCampo: Record<string, string> = {};
          const { mensagemGeral } = aplicarErrosApi(
            err,
            (chave, msg) => {
              if (chave !== 'novaSenha' && chave !== 'confirmacaoNovaSenha') return false;
              doCampo[chave] = msg;
              return true;
            },
            { padrao: 'Não foi possível cadastrar a nova senha.' }
          );
          this.erros.set(doCampo);
          this.erro.set(mensagemGeral);
          this.erroToken.set(/link|token/i.test(mensagemGeral));
        },
      });
  }
}
