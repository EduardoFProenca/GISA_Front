import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { GrauParentesco } from '../../../../../core/models/paciente.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-info-responsavel',
  styleUrl: './info-responsavel.scss',
  templateUrl: './info-responsavel.html',
})
export class InfoResponsavel {
  responsavelData = {
    nome: '',
    cpf: '',
    telefone: '',
    ocupacao: '',
    grauParentesco: '' as GrauParentesco | ''
  };

  opcoesParentesco: { label: string; value: GrauParentesco }[] = [
    { label: 'Pai', value: 'PAI' },
    { label: 'Mãe', value: 'MAE' },
    { label: 'Avô / Avó', value: 'AVO' },
    { label: 'Tio / Tia', value: 'TIO' },
    { label: 'Irmão / Irmã', value: 'IRMAO' },
    { label: 'Tutor Legal', value: 'TUTOR_LEGAL' },
    { label: 'Outro', value: 'OUTRO' }
  ];
}
