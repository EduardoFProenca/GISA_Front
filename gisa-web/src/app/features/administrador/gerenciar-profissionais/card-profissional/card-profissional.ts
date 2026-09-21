import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
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

  private router = inject(Router);

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  abrirDetalhe() {
    this.router.navigateByUrl(`/administrador/profissionais/${this.profissional.id}`);
  }

  abrirEdicao(event: Event) {
    event.stopPropagation(); // impede que o clique "vaze" pro card e dispare abrirDetalhe() também
    this.router.navigateByUrl(`/administrador/profissionais/${this.profissional.id}/editar`);
  }
}