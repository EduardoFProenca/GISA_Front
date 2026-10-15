import { Component, Input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

export type TomIcone = 'celeste' | 'azul' | 'verde' | 'ambar' | 'vermelho';

@Component({
  selector: 'app-card-estatistica',
  imports: [NgIcon],
  templateUrl: './card-estatistica.html',
  styleUrl: './card-estatistica.scss',
})
export class CardEstatistica {
  @Input() titulo: string = '';
  @Input() valor: number | string = 0;
  @Input() icone: string = '';
  // Tom do fundo do ícone, da paleta de tokens (--<tom>-100).
  @Input() tom: TomIcone = 'celeste';

}