import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';

@Component({
  imports: [FormsModule],
  selector: 'app-info-prontuario',
  styleUrl: './info-prontuario.scss',
  templateUrl: './info-prontuario.html',
})
export class InfoProntuario extends ComErros {
  alergias = '';
  comorbidade = '';
  mobilidade = '';

  limpar() {
    this.alergias = '';
    this.comorbidade = '';
    this.mobilidade = '';
    this.erros = {};
  }
}
