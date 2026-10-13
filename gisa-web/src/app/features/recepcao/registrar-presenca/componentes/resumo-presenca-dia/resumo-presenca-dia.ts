import { Component, input } from '@angular/core';
import { CardEstatistica } from '../../../../../shared/components/card-estatistica/card-estatistica';
import { ICONES } from '../../../../../shared/icons';
import { ResumoPresenca } from '../../presenca.util';

@Component({
  selector: 'app-resumo-presenca-dia',
  imports: [CardEstatistica],
  templateUrl: './resumo-presenca-dia.html',
  styleUrl: './resumo-presenca-dia.scss',
})
export class ResumoPresencaDia {
  resumo = input.required<ResumoPresenca>();
  icones = ICONES;
}