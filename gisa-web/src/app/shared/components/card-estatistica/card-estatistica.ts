import { Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

export type TomIcone = 'celeste' | 'azul' | 'verde' | 'ambar' | 'vermelho';

@Component({
  selector: 'app-card-estatistica',
  imports: [NgIcon, NgTemplateOutlet, RouterLink],
  templateUrl: './card-estatistica.html',
  styleUrl: './card-estatistica.scss',
})
export class CardEstatistica {
  @Input() titulo: string = '';
  @Input() valor: number | string = 0;
  @Input() icone: string = '';
  // Tom do fundo do ícone, da paleta de tokens (--<tom>-100).
  @Input() tom: TomIcone = 'celeste';
  // Rota da tela que detalha o número; com ela o card vira link (cursor de clique).
  @Input() link?: string;
}
