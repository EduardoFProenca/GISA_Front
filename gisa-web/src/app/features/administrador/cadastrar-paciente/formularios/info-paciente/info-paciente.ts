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
  statusOpcoes = [
    { label: 'Matriculado', value: 'MATRICULADO' },
    { label: 'Desligado', value: 'DESLIGADO' },
    { label: 'Alta', value: 'ALTA' },
  ];

  paciente = {
    statusPaciente: '',
    convenio: false,
    dataCadastro: new Date().toISOString().substring(0, 10)
  };
}
