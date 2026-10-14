import { Component, Input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

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
  @Input() corIcone: string = '#e0f2fe';

}