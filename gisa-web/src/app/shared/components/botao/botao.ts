import { booleanAttribute, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

export type VarianteBotao =
  | 'primario' | 'contorno' | 'neutro' | 'suave'
  | 'perigo' | 'perigo-suave' | 'sucesso-suave'
  | 'fantasma' | 'link';
export type TamanhoBotao = 'sm' | 'md';

// Botão padrão do sistema. Fica "pendurado" no <button>/<a> nativo (seletor de atributo),
// então type, disabled, routerLink e acessibilidade continuam do próprio elemento.
// Uso: <button appBotao type="button" variante="neutro">Cancelar</button>
@Component({
  selector: 'button[appBotao], a[appBotao]',
  imports: [NgIcon],
  template: `
    @if (icone()) {
      <ng-icon [name]="icone()!" aria-hidden="true" />
    }
    <ng-content />
  `,
  styleUrl: './botao.scss',
  host: {
    '[attr.data-variante]': 'variante()',
    '[attr.data-tamanho]': 'tamanho()',
    '[attr.data-somente-icone]': 'somenteIcone() || null',
  },
})
export class Botao {
  variante = input<VarianteBotao>('primario');
  tamanho = input<TamanhoBotao>('md');
  icone = input<string>();
  somenteIcone = input(false, { transform: booleanAttribute });
}
