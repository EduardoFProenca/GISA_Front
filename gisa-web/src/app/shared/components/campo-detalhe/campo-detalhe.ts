import { Component, input } from '@angular/core';

// Um dado de uma tela de detalhe: rótulo pequeno e discreto acima do valor.
// Fica dentro de .info-bloco, que organiza os campos em colunas (styles.scss).
// Uso: <app-campo-detalhe rotulo="Cargo">{{ cargo.nome }}</app-campo-detalhe>
@Component({
  selector: 'app-campo-detalhe',
  template: `<span class="rotulo">{{ rotulo() }}</span><div class="valor"><ng-content /></div>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    .rotulo {
      display: block;
      margin-bottom: 0.15rem;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--cor-texto-secundario);
    }

    .valor {
      font-size: 0.92rem;
      color: var(--cor-texto);
      overflow-wrap: anywhere;
    }
  `,
})
export class CampoDetalhe {
  rotulo = input.required<string>();
}
