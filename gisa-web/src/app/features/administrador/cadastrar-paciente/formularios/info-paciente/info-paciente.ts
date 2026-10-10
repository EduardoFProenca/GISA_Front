import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-info-paciente',
  styleUrl: './info-paciente.scss',
  templateUrl: './info-paciente.html',
})
export class InfoPaciente {
  // O status (MATRICULADO) e a data de cadastro são definidos pelo back; não são enviados.
  pacienteData = {
    convenio: false
  };
}
