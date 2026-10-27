import { Component, input, output } from '@angular/core';

// Diálogo com formulário: o conteúdo (campos) vem por <ng-content>.
// Uso:
//   <app-form-dialog [aberto]="x()" titulo="..." [erro]="erro()" (confirmar)="..." (cancelar)="...">
//     <div class="campo">...</div>
//   </app-form-dialog>
@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.html',
  styleUrl: './form-dialog.scss',
})
export class FormDialog {
  aberto = input(false);
  titulo = input('');
  descricao = input('');
  erro = input('');
  textoConfirmar = input('Salvar');
  textoCancelar = input('Cancelar');
  salvando = input(false);
  // false: o conteúdo não rola por dentro; o diálogo cresce conforme os campos.
  // Para formulários curtos cujas listas longas rolam por conta própria (ex.: autocomplete de CBO).
  rolagem = input(true);

  confirmar = output<void>();
  cancelar = output<void>();
}
