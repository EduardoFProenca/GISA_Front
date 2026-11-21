// selecao-tipo.ts
import { Component, output } from '@angular/core';
import { Botao } from '../../../../shared/components/botao/botao';

export type TipoProfissional = 'medico' | 'assistente-social';

@Component({
  selector: 'app-selecao-tipo',
  imports: [Botao],
  templateUrl: './selecao-tipo.html',
})
export class SelecaoTipo {
  tipoSelecionado = output<TipoProfissional>();

  selecionar(tipo: TipoProfissional) {
    this.tipoSelecionado.emit(tipo);
  }
}