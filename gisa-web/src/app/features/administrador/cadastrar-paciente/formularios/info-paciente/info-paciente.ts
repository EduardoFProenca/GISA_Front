import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';

@Component({
  imports: [FormsModule],
  selector: 'app-info-paciente',
  styleUrl: './info-paciente.scss',
  templateUrl: './info-paciente.html',
})
export class InfoPaciente extends ComErros {
  // O status (MATRICULADO) e a data de cadastro são definidos pelo back; não são enviados.
  convenio = false;

  limpar() {
    this.convenio = false;
    this.erros = {};
  }
}
