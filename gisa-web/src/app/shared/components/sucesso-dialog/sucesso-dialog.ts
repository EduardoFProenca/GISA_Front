import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ICONES } from '../../icons';

@Component({
  selector: 'app-sucesso-dialog',
  imports: [NgIcon],
  templateUrl: './sucesso-dialog.html',
  styleUrl: './sucesso-dialog.scss',
})
export class SucessoDialog {
  readonly icones = ICONES;
  @Input() aberto: boolean = false;
  @Input() titulo: string = 'Cadastro realizado com sucesso!';
  @Input() mensagem: string = 'O profissional foi cadastrado no sistema.';
  @Input() textoPrimario: string = 'Ver detalhes';
  @Input() textoSecundario: string = 'Continuar cadastrando';

  @Output() verDetalhes = new EventEmitter<void>();
  @Output() continuar = new EventEmitter<void>();

  aoVerDetalhes() {
    this.verDetalhes.emit();
  }

  aoContinuar() {
    this.continuar.emit();
  }
}