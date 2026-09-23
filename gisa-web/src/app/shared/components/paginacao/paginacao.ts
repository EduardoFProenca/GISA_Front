import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-paginacao',
  imports: [],
  templateUrl: './paginacao.html',
  styleUrl: './paginacao.scss',
})
export class Paginacao implements OnChanges {
  @Input() totalItens: number = 0;
  @Input() itensPorPagina: number = 10;
  @Input() paginaAtual: number = 1;
  @Output() paginaAlterada = new EventEmitter<number>();

  totalPaginas: number = 1;
  paginas: number[] = [];

  ngOnChanges() {
    this.totalPaginas = Math.max(1, Math.ceil(this.totalItens / this.itensPorPagina));
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irPara(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaAtual) return;
    this.paginaAlterada.emit(pagina);
  }
}