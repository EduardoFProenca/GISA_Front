import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { Cbo } from '../../../../core/models/cargo.model';
import { CargoService } from '../../../../core/services/cargo';
import { aplicarErrosApi } from '../../../../core/http/erro-api';
import { apenasDigitos, formatarCodigoCbo } from '../../cargos/cbo.util';

// Criar (cbo = null) ou editar CBO. Na edição só o título muda: o código identifica o registro.
@Component({
  selector: 'app-dialog-cbo',
  imports: [FormsModule, FormDialog],
  templateUrl: './dialog-cbo.html',
})
export class DialogCbo {
  private cargoService = inject(CargoService);

  aberto = input(false);
  cbo = input<Cbo | null>(null);

  salvo = output<Cbo>();
  cancelar = output<void>();

  codigo = signal('');
  titulo = signal('');
  erros = signal<Record<string, string>>({});
  erro = signal('');
  salvando = signal(false);

  constructor() {
    effect(() => {
      if (!this.aberto()) return;
      const c = this.cbo();
      untracked(() => {
        this.codigo.set(c ? formatarCodigoCbo(c.codigoCBO) : '');
        this.titulo.set(c?.tituloCBO ?? '');
        this.erros.set({});
        this.erro.set('');
      });
    });
  }

  salvar() {
    if (this.salvando()) return;
    const atual = this.cbo();
    const codigoCBO = apenasDigitos(this.codigo());
    const tituloCBO = this.titulo().trim();

    const erros: Record<string, string> = {};
    if (!atual && codigoCBO.length !== 6) erros['codigoCBO'] = 'O código deve ter 6 dígitos (ex.: 2515-10).';
    if (!tituloCBO) erros['tituloCBO'] = 'Informe o título do CBO.';
    this.erros.set(erros);
    this.erro.set('');
    if (Object.keys(erros).length) return;

    if (atual && tituloCBO === atual.tituloCBO) {
      this.cancelar.emit();
      return;
    }

    const req = atual
      ? this.cargoService.atualizarCbo(atual.codigoCBO, { tituloCBO })
      : this.cargoService.criarCbo({ codigoCBO, tituloCBO });

    this.salvando.set(true);
    req.subscribe({
      next: (c) => {
        this.salvando.set(false);
        this.salvo.emit(c);
      },
      error: (err) => {
        this.salvando.set(false);
        const campos: Record<string, string> = {};
        const { mensagemGeral } = aplicarErrosApi(
          err,
          (chave, msg) => {
            if (chave !== 'codigoCBO' && chave !== 'tituloCBO') return false;
            campos[chave] = msg;
            return true;
          },
          {
            padrao: 'Não foi possível salvar o CBO.',
            // "CBO já cadastrado." chega só em message.
            marcarPorMensagem: (msg) => {
              if (!/já cadastrado/i.test(msg)) return false;
              campos['codigoCBO'] = msg;
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
