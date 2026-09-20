import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Layout } from '../../../core/layout/layout';

@Component({
  selector: 'app-cabecalho-pagina',
  imports: [],
  templateUrl: './cabecalho-pagina.html',
  styleUrl: './cabecalho-pagina.scss',
})
export class CabecalhoPagina {
  private router = inject(Router);
  layout = inject(Layout);

  @Input() titulo: string = '';
  @Input() mostrarSalvar: boolean = false;
  @Output() salvar = new EventEmitter<void>();

  voltar() {
    this.router.navigateByUrl('/');
  }

  aoClicarSalvar() {
    this.salvar.emit();
  }
}