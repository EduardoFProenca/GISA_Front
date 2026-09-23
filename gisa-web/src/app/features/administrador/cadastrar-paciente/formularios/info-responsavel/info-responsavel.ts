import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-info-responsavel',
  styleUrl: './info-responsavel.scss',
  templateUrl: './info-responsavel.html',
})
export class InfoResponsavel {
  parentescoOpcoes = [
    { label: 'Mãe', value: 'MAE' },
    { label: 'Pai', value: 'PAI' },
    { label: 'Avô/Avó', value: 'AVO' },
    { label: 'Tutor Legal', value: 'TUTOR_LEGAL' },
    { label: 'Outro', value: 'OUTRO' }
  ];

  responsavel = {
    ocupacao: '',
    grauParentesco: 'MAE'
  };
}
