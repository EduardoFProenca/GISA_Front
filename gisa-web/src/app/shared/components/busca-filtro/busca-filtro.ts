import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONES } from '../../icons';

export interface OpcaoFiltro {
  chave: string;
  label: string;
  opcoes: { valor: string; label: string }[];
}

export interface EstadoBusca {
  termo: string;
  filtros: Record<string, string>;
}

@Component({
  selector: 'app-busca-filtro',
  imports: [FormsModule],
  templateUrl: './busca-filtro.html',
  styleUrl: './busca-filtro.scss',
})
export class BuscaFiltro {
  @Input() placeholder: string = 'Buscar...';
  @Input() filtrosDisponiveis: OpcaoFiltro[] = [];
  @Output() buscaAlterada = new EventEmitter<EstadoBusca>();

  icones = ICONES;
  termo: string = '';
  filtrosSelecionados: Record<string, string> = {};

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  emitirMudanca() {
    this.buscaAlterada.emit({
      termo: this.termo,
      filtros: this.filtrosSelecionados,
    });
  }
}