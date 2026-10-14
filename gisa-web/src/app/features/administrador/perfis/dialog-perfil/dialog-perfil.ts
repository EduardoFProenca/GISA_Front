import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { PerfilDetalhe, PerfilResumo, Permissao } from '../../../../core/models/perfil.model';
import { PerfilService } from '../../../../core/services/perfil';
import { aplicarErrosApi } from '../../../../core/http/erro-api';

// Criar perfil (nome + permissões iniciais) ou renomear (perfil informado: só o nome).
// As permissões de um perfil existente são geridas na tela de detalhe, uma a uma.
@Component({
  selector: 'app-dialog-perfil',
  imports: [FormsModule, FormDialog],
  templateUrl: './dialog-perfil.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class DialogPerfil {
  private perfilService = inject(PerfilService);

  aberto = input(false);
  perfil = input<PerfilResumo | null>(null);
  // Opções de permissão do cadastro (GET /permissoes).
  permissoes = input<Permissao[]>([]);

  salvo = output<PerfilDetalhe>();
  cancelar = output<void>();

  nome = signal('');
  selecionadas = signal<ReadonlySet<number>>(new Set());
  erroNome = signal('');
  erro = signal('');
  salvando = signal(false);

  constructor() {
    effect(() => {
      if (!this.aberto()) return;
      const p = this.perfil();
      untracked(() => {
        this.nome.set(p?.nome ?? '');
        this.selecionadas.set(new Set());
        this.erroNome.set('');
        this.erro.set('');
      });
    });
  }

  alternar(id: number, marcado: boolean) {
    this.selecionadas.update((atual) => {
      const novo = new Set(atual);
      if (marcado) novo.add(id);
      else novo.delete(id);
      return novo;
    });
  }

  salvar() {
    if (this.salvando()) return;
    const nome = this.nome().trim();
    this.erro.set('');
    this.erroNome.set(nome ? '' : 'Informe o nome do perfil.');
    if (!nome) return;

    const atual = this.perfil();
    if (atual && nome === atual.nome) {
      this.cancelar.emit();
      return;
    }

    const req = atual
      ? this.perfilService.atualizar(atual.idPerfil, { nome })
      : this.perfilService.criar({ nome, permissoesIds: [...this.selecionadas()] });

    this.salvando.set(true);
    req.subscribe({
      next: (p) => {
        this.salvando.set(false);
        this.salvo.emit(p);
      },
      error: (err) => {
        this.salvando.set(false);
        let mensagemNome = '';
        const { mensagemGeral } = aplicarErrosApi(
          err,
          (chave, msg) => {
            if (chave !== 'nome') return false;
            mensagemNome = msg;
            return true;
          },
          {
            padrao: 'Não foi possível salvar o perfil.',
            // "Já existe um perfil com esse nome." chega só em message.
            marcarPorMensagem: (msg) => {
              if (!/nome/i.test(msg)) return false;
              mensagemNome = msg;
              return true;
            },
          }
        );
        this.erroNome.set(mensagemNome);
        this.erro.set(mensagemNome ? '' : mensagemGeral);
      },
    });
  }
}
