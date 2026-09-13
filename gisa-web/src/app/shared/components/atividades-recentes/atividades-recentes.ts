import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface AcaoAtividade {
  label: string;
  iconeSvg?: string;
  acao: () => void;
}

export interface Atividade {
  descricao: string;
  tempoAtras: string;
  acoes?: AcaoAtividade[];
}

@Component({
  selector: 'app-atividades-recentes',
  imports: [],
  templateUrl: './atividades-recentes.html',
  styleUrl: './atividades-recentes.scss'
})
export class AtividadesRecentes {
  @Input() atividades: Atividade[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}