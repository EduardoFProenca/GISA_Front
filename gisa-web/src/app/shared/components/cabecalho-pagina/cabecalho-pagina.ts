import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ICONES } from '../../icons';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Layout } from '../../../core/layout/layout';

@Component({
  selector: 'app-cabecalho-pagina',
  imports: [NgIcon],
  templateUrl: './cabecalho-pagina.html',
  styleUrl: './cabecalho-pagina.scss',
})
export class CabecalhoPagina {
  readonly icones = ICONES;
  private router = inject(Router);
  private location = inject(Location);
  layout = inject(Layout);

  @Input() titulo: string = '';
  @Input() mostrarSalvar: boolean = false;
  @Input() mostrarCancelar: boolean = false;
  @Input() textoAcao: string = '';
  @Input() rotaAcao: string = '';
  @Output() salvar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  // Botão de ação sem rotaAcao (ex.: abrir um diálogo).
  @Output() acao = new EventEmitter<void>();

  voltar() {
    this.location.back();
  }

  aoClicarSalvar() {
    this.salvar.emit();
  }

  aoClicarCancelar() {
    this.cancelar.emit();
  }

  aoClicarAcao() {
    if (this.rotaAcao) {
      this.router.navigateByUrl(this.rotaAcao);
    } else {
      this.acao.emit();
    }
  }
}