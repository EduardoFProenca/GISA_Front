import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONES } from '../../../../shared/icons';

export interface ProfissionalCard {
  id: string;
  nome: string;
  especialidade: string;
  registro: string;
  ativo: boolean;
}

@Component({
  selector: 'app-card-profissional',
  imports: [],
  templateUrl: './card-profissional.html',
  styleUrl: './card-profissional.scss',
})
export class CardProfissional {
  @Input() profissional!: ProfissionalCard;
  icones = ICONES;

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}