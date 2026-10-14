import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Auth } from '../../../core/auth/auth';
import { aplicarErrosApi } from '../../../core/http/erro-api';
import { UsuarioService } from '../../../core/services/usuario';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ICONES } from '../../../shared/icons';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';

const MIN_SENHA = 8;
const MAX_SENHA = 30;

type Campo = 'senhaAtual' | 'novaSenha' | 'confirmacaoNovaSenha';

// "Alterar minha senha" (PATCH /usuarios/minha-senha), disponível em todos os painéis.
// A API devolve um token novo e invalida os anteriores: o UsuarioService já troca o token salvo,
// então o usuário continua logado neste navegador e é desconectado nos outros.
@Component({
  selector: 'app-alterar-senha',
  imports: [FormsModule, NgIcon, CabecalhoPagina],
  templateUrl: './alterar-senha.html',
  styleUrl: './alterar-senha.scss',
})
export class AlterarSenha {
  private avisoSucesso = inject(AvisoSucessoService);
  private usuarioService = inject(UsuarioService);
  readonly nome = inject(Auth).usuarioAtual()?.nome ?? '';
  readonly icones = ICONES;
  readonly minimo = MIN_SENHA;
  readonly maximo = MAX_SENHA;

  senhaAtual = '';
  novaSenha = '';
  confirmacaoNovaSenha = '';
  mostrarSenhas = signal(false);

  erros = signal<Partial<Record<Campo, string>>>({});
  erro = signal('');
  salvando = signal(false);

  limparErro(campo: Campo) {
    this.erros.update((e) => {
      const { [campo]: _, ...resto } = e;
      return resto;
    });
  }

  private validar(): boolean {
    const e: Partial<Record<Campo, string>> = {};
    if (!this.senhaAtual) e.senhaAtual = 'Informe a sua senha atual.';
    if (!this.novaSenha) e.novaSenha = 'Informe a nova senha.';
    else if (this.novaSenha.length < MIN_SENHA || this.novaSenha.length > MAX_SENHA) {
      e.novaSenha = `A senha deve ter entre ${MIN_SENHA} e ${MAX_SENHA} caracteres.`;
    } else if (this.novaSenha === this.senhaAtual) {
      e.novaSenha = 'A nova senha deve ser diferente da atual.';
    }
    if (!this.confirmacaoNovaSenha) e.confirmacaoNovaSenha = 'Repita a nova senha.';
    else if (this.novaSenha && this.confirmacaoNovaSenha !== this.novaSenha) {
      e.confirmacaoNovaSenha = 'A confirmação não corresponde à nova senha.';
    }
    this.erros.set(e);
    return Object.keys(e).length === 0;
  }

  salvar() {
    if (this.salvando()) return;
    this.erro.set('');
    if (!this.validar()) return;

    this.salvando.set(true);
    this.usuarioService
      .alterarMinhaSenha({
        senhaAtual: this.senhaAtual,
        novaSenha: this.novaSenha,
        confirmacaoNovaSenha: this.confirmacaoNovaSenha,
      })
      .subscribe({
        next: () => {
          this.salvando.set(false);
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmacaoNovaSenha = '';
          this.avisoSucesso.mostrar({ titulo: 'Senha alterada', detalhe: 'Use a nova senha no próximo login.' });
        },
        error: (err) => {
          this.salvando.set(false);
          const campos: Partial<Record<Campo, string>> = {};
          const { mensagemGeral } = aplicarErrosApi(
            err,
            (chave, msg) => {
              if (chave !== 'senhaAtual' && chave !== 'novaSenha' && chave !== 'confirmacaoNovaSenha') return false;
              campos[chave] = msg;
              return true;
            },
            {
              padrao: 'Não foi possível alterar a senha.',
              // Regras de negócio chegam só em message: leva cada uma para o campo dela.
              marcarPorMensagem: (msg) => {
                if (/senha atual está incorreta/i.test(msg)) campos.senhaAtual = msg;
                else if (/confirmação/i.test(msg)) campos.confirmacaoNovaSenha = msg;
                else if (/diferente da senha atual/i.test(msg)) campos.novaSenha = msg;
                else return false;
                return true;
              },
            }
          );
          this.erros.set(campos);
          this.erro.set(Object.keys(campos).length ? '' : mensagemGeral);
        },
      });
  }
}
