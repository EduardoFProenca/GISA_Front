// selecao-tipo.ts
import { Component, output } from '@angular/core';

export type TipoProfissional = 'medico' | 'assistente-social';

@Component({
  selector: 'app-selecao-tipo',
  templateUrl: './selecao-tipo.html',
})
export class SelecaoTipo {
  tipoSelecionado = output<TipoProfissional>();

  selecionar(tipo: TipoProfissional) {
    this.tipoSelecionado.emit(tipo);
  }
}