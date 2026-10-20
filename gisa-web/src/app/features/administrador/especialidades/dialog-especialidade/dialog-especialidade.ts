import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { AtualizacaoEspecialidadePayload, Especialidade } from '../../../../core/models/especialidade.model';
import { EspecialidadeService } from '../../../../core/services/especialidade';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';
import { aplicarErrosApi } from '../../../../core/http/erro-api';
import { Filtro } from '../../../../shared/directives/filtro.directive';

// Criar (especialidade = null) ou editar especialidade. No PATCH só vai o que mudou (descrição vazia = null, limpa).
@Component({
  selector: 'app-dialog-especialidade',
  imports: [FormsModule, FormDialog, Filtro],
  templateUrl: './dialog-especialidade.html',
})
export class DialogEspecialidade {
  private avisoSucesso = inject(AvisoSucessoService);
  private especialidadeService = inject(EspecialidadeService);

  aberto = input(false);
  especialidade = input<Especialidade | null>(null);

  salvo = output<Especialidade>();
  cancelar = output<void>();

  nome = signal('');
  descricao = signal('');
  erros = signal<Record<string, string>>({});
  erro = signal('');
  salvando = signal(false);

  constructor() {
    // Cada abertura começa da especialidade atual (ou vazia).
    effect(() => {
      if (!this.aberto()) return;
      const e = this.especialidade();
      untracked(() => {
        this.nome.set(e?.nome ?? '');
        this.descricao.set(e?.descricao ?? '');
        this.erros.set({});
        this.erro.set('');
      });
    });
  }

  salvar() {
    if (this.salvando()) return;
    const nome = this.nome().trim();
    const descricao = this.descricao().trim();
    this.erros.set(nome ? {} : { nome: 'Informe o nome da especialidade.' });
    this.erro.set('');
    if (!nome) return;

    const atual = this.especialidade();
    let req: Observable<Especialidade>;
    if (atual) {
      const dados: AtualizacaoEspecialidadePayload = {};
      if (nome !== atual.nome) dados.nome = nome;
      if (descricao !== (atual.descricao ?? '')) dados.descricao = descricao || null;
      if (!Object.keys(dados).length) {
        this.cancelar.emit();
        return;
      }
      req = this.especialidadeService.atualizar(atual.idEspecialidade, dados);
    } else {
      req = this.especialidadeService.criar({ nome, descricao: descricao || undefined });
    }

    this.salvando.set(true);
    req.subscribe({
      next: (e) => {
        this.salvando.set(false);
        this.avisoSucesso.mostrar({ titulo: atual ? 'Especialidade atualizada' : 'Especialidade cadastrada', detalhe: e.nome });
        this.salvo.emit(e);
      },
      error: (err) => {
        this.salvando.set(false);
        const campos: Record<string, string> = {};
        const { mensagemGeral } = aplicarErrosApi(
          err,
          (chave, msg) => {
            if (chave !== 'nome') return false;
            campos[chave] = msg;
            return true;
          },
          {
            padrao: 'Não foi possível salvar a especialidade.',
            // "Já existe uma especialidade com esse nome." chega só em message.
            marcarPorMensagem: (msg) => {
              if (!/nome/i.test(msg)) return false;
              campos['nome'] = msg;
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
