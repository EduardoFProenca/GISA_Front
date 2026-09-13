import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-card-estatistica',
  imports: [],
  templateUrl: './card-estatistica.html',
  styleUrl: './card-estatistica.scss',
})
export class CardEstatistica {
  @Input() titulo: string = '';
  @Input() valor: number | string = 0;
  @Input() iconeSvg: string = '';
  @Input() corIcone: string = '#e0f2fe';

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}