import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusPaciente } from '../../../../../core/models/paciente.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-info-paciente',
  styleUrl: './info-paciente.scss',
  templateUrl: './info-paciente.html',
})
export class InfoPaciente {
  pacienteData = {
    convenio: false,
    statusPaciente: 'MATRICULADO' as StatusPaciente
  };
}
