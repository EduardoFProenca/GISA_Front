import { Component, Input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-card-estatistica',
  styleUrl: './card-estatistica.scss',
  templateUrl: './card-estatistica.html',
})
export class CardEstatistica {
  @Input() titulo: string = '';
  @Input() valor: number | string = 0;
  @Input() icone: string = '';
  @Input() corIcone: string = '#e0f2fe';
}
