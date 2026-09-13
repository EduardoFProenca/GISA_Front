import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface AcaoRapida {
  titulo: string;
  descricao: string;
  iconeSvg: string;
  rota: string;
}

@Component({
  selector: 'app-painel-acoes',
  imports: [RouterLink, ],
  templateUrl: './painel-acoes.html',
  styleUrl: './painel-acoes.scss'
})
export class PainelAcoesComponent {
  @Input() acoes: AcaoRapida[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}