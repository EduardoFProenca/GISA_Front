import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
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
  imports: [NgIcon, FormsModule],
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


  emitirMudanca() {
    this.buscaAlterada.emit({
      termo: this.termo,
      filtros: this.filtrosSelecionados,
    });
  }
}