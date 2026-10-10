import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoEscola } from '../../../../../core/models/paciente.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-info-escola',
  styleUrl: './info-escola.scss',
  templateUrl: './info-escola.html',
})
export class InfoEscola {
  escolaData = {
    nome: '',
    tipoEscola: '' as TipoEscola | '',
    telefone: ''
  };

  opcoesTipoEscola: { label: string; value: TipoEscola }[] = [
    { label: 'Pública', value: 'PUBLICA' },
    { label: 'Particular', value: 'PARTICULAR' }
  ];
}
