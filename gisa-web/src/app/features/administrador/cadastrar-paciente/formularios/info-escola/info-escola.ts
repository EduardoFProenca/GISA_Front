import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-info-escola',
  styleUrl: './info-escola.scss',
  templateUrl: './info-escola.html',
})
export class InfoEscola {
  tiposEscola = [
    { label: 'Pública', value: 'PUBLICA' },
    { label: 'Particular', value: 'PARTICULAR' }
  ];

  escola = {
    nome: '',
    tipoEscola: '',
    telefone: ''
  };
}
