import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { Mascara } from '../../../../shared/directives/mascara.directive';
import { AtualizacaoEscolaPayload, Escola, TipoEscola } from '../../../../core/models/escola.model';
import { EscolaService } from '../../../../core/services/escola';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';
import { aplicarErrosApi } from '../../../../core/http/erro-api';
import { soDigitos } from '../../../../shared/utils/texto.util';
import { ROTULO_TIPO_ESCOLA } from '../../../../shared/utils/rotulos.util';
import { Filtro } from '../../../../shared/directives/filtro.directive';

// Criar (escola = null) ou editar escola. No PATCH só vai o que mudou (telefone vazio = null, limpa).
@Component({
  selector: 'app-dialog-escola',
  imports: [FormsModule, FormDialog, Mascara, Filtro],
  templateUrl: './dialog-escola.html',
})
export class DialogEscola {
  private avisoSucesso = inject(AvisoSucessoService);
  private escolaService = inject(EscolaService);

  readonly rotuloTipo = ROTULO_TIPO_ESCOLA;
  readonly tipos = Object.keys(ROTULO_TIPO_ESCOLA) as TipoEscola[];

  aberto = input(false);
  escola = input<Escola | null>(null);

  salvo = output<Escola>();
  cancelar = output<void>();

  nome = signal('');
  tipoEscola = signal<TipoEscola | ''>('');
  telefone = signal('');
  erros = signal<Record<string, string>>({});
  erro = signal('');
  salvando = signal(false);

  constructor() {
    // Cada abertura começa da escola atual (ou vazia).
    effect(() => {
      if (!this.aberto()) return;
      const e = this.escola();
      untracked(() => {
        this.nome.set(e?.nome ?? '');
        this.tipoEscola.set(e?.tipoEscola ?? '');
        this.telefone.set(e?.telefone ?? '');
        this.erros.set({});
        this.erro.set('');
      });
    });
  }

  salvar() {
    if (this.salvando()) return;
    const nome = this.nome().trim();
    const tipoEscola = this.tipoEscola();
    const telefone = soDigitos(this.telefone());
    const erros: Record<string, string> = {};
    if (!nome) erros['nome'] = 'Informe o nome da escola.';
    if (!tipoEscola) erros['tipoEscola'] = 'Selecione o tipo da escola.';
    if (telefone && telefone.length < 10) erros['telefone'] = 'Telefone incompleto.';
    this.erros.set(erros);
    this.erro.set('');
    if (Object.keys(erros).length || !tipoEscola) return;

    const atual = this.escola();
    let req: Observable<Escola>;
    if (atual) {
      const dados: AtualizacaoEscolaPayload = {};
      if (nome !== atual.nome) dados.nome = nome;
      if (tipoEscola !== atual.tipoEscola) dados.tipoEscola = tipoEscola;
      if (telefone !== (atual.telefone ?? '')) dados.telefone = telefone || null;
      if (!Object.keys(dados).length) {
        this.cancelar.emit();
        return;
      }
      req = this.escolaService.atualizar(atual.idEscola, dados);
    } else {
      req = this.escolaService.cadastrar({ nome, tipoEscola, telefone: telefone || undefined });
    }

    this.salvando.set(true);
    req.subscribe({
      next: (e) => {
        this.salvando.set(false);
        this.avisoSucesso.mostrar({ titulo: atual ? 'Escola atualizada' : 'Escola cadastrada', detalhe: e.nome });
        this.salvo.emit(e);
      },
      error: (err) => {
        this.salvando.set(false);
        const campos: Record<string, string> = {};
        const { mensagemGeral } = aplicarErrosApi(
          err,
          (chave, msg) => {
            if (chave !== 'nome' && chave !== 'tipoEscola') return false;
            campos[chave] = msg;
            return true;
          },
          { padrao: 'Não foi possível salvar a escola.' }
        );
        this.erros.set(campos);
        this.erro.set(Object.keys(campos).length ? '' : mensagemGeral);
      },
    });
  }
}
