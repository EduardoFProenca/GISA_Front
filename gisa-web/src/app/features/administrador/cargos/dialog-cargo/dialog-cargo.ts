import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { Cargo, Cbo } from '../../../../core/models/cargo.model';
import { CargoService } from '../../../../core/services/cargo';
import { aplicarErrosApi } from '../../../../core/http/erro-api';
import { SeletorCbo } from '../seletor-cbo/seletor-cbo';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';
import { Filtro } from '../../../../shared/directives/filtro.directive';

// Criar (cargo = null) ou editar cargo. No PATCH só vai o que mudou.
@Component({
  selector: 'app-dialog-cargo',
  imports: [FormsModule, FormDialog, SeletorCbo, Filtro],
  templateUrl: './dialog-cargo.html',
})
export class DialogCargo {
  private avisoSucesso = inject(AvisoSucessoService);
  private cargoService = inject(CargoService);

  aberto = input(false);
  cargo = input<Cargo | null>(null);

  salvo = output<Cargo>();
  cancelar = output<void>();

  nome = signal('');
  cbo = signal<Cbo | null>(null);
  erros = signal<Record<string, string>>({});
  erro = signal('');
  salvando = signal(false);

  constructor() {
    // Cada abertura começa do cargo atual (ou vazio).
    effect(() => {
      if (!this.aberto()) return;
      const c = this.cargo();
      untracked(() => {
        this.nome.set(c?.nome ?? '');
        this.cbo.set(c ? { codigoCBO: c.codigoCBO, tituloCBO: c.tituloCBO } : null);
        this.erros.set({});
        this.erro.set('');
      });
    });
  }

  salvar() {
    if (this.salvando()) return;
    const nome = this.nome().trim();
    const cbo = this.cbo();
    const erros: Record<string, string> = {};
    if (!nome) erros['nome'] = 'Informe o nome do cargo.';
    if (!cbo) erros['codigoCBO'] = 'Selecione o CBO (ou cadastre um novo).';
    this.erros.set(erros);
    this.erro.set('');
    if (!nome || !cbo) return;

    const atual = this.cargo();
    let req: Observable<Cargo>;
    if (atual) {
      const dados: { nome?: string; codigoCBO?: string } = {};
      if (nome !== atual.nome) dados.nome = nome;
      if (cbo.codigoCBO !== atual.codigoCBO) dados.codigoCBO = cbo.codigoCBO;
      if (!Object.keys(dados).length) {
        this.cancelar.emit();
        return;
      }
      req = this.cargoService.atualizar(atual.idCargo, dados);
    } else {
      req = this.cargoService.criar({ nome, codigoCBO: cbo.codigoCBO });
    }

    this.salvando.set(true);
    req.subscribe({
      next: (c) => {
        this.salvando.set(false);
        this.avisoSucesso.mostrar({ titulo: atual ? 'Cargo atualizado' : 'Cargo cadastrado', detalhe: c.nome });
        this.salvo.emit(c);
      },
      error: (err) => {
        this.salvando.set(false);
        const campos: Record<string, string> = {};
        const { mensagemGeral } = aplicarErrosApi(
          err,
          (chave, msg) => {
            if (chave !== 'nome' && chave !== 'codigoCBO') return false;
            campos[chave] = msg;
            return true;
          },
          {
            padrao: 'Não foi possível salvar o cargo.',
            // "Já existe um cargo com esse nome." chega só em message.
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
