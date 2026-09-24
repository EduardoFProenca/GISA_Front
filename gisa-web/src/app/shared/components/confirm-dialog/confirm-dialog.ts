import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  @Input() aberto: boolean = false;
  @Input() titulo: string = 'Confirmar ação';
  @Input() mensagem: string = 'Tem certeza que deseja continuar?';
  @Input() textoConfirmar: string = 'Confirmar';
  @Input() textoCancelar: string = 'Cancelar';

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  aoConfirmar() {
    this.confirmar.emit();
  }

  aoCancelar() {
    this.cancelar.emit();
  }
}