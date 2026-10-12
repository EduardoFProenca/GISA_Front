import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
  selector: 'app-info-paciente',
  styleUrl: './info-paciente.scss',
  templateUrl: './info-paciente.html',
})
export class InfoPaciente extends ComErros {
  // O status (MATRICULADO) e a data de cadastro são definidos pelo back; não são enviados.
  convenio = false;

  // Edição: já vem com o valor do paciente.
  @Input() set convenioInicial(valor: boolean | undefined) {
    this.convenio = !!valor;
  }

  limpar() {
    this.convenio = false;
    this.erros = {};
  }
}
