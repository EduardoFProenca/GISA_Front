import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-info-prontuario',
  styleUrl: './info-prontuario.scss',
  templateUrl: './info-prontuario.html',
})
export class InfoProntuario {
  prontuarioData = {
    alergias: '',
    comorbidade: '',
    mobilidade: ''
  };
}
