import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
  selector: 'app-info-prontuario',
  styleUrl: './info-prontuario.scss',
  templateUrl: './info-prontuario.html',
})
export class InfoProntuario extends ComErros {
  alergias = '';
  comorbidade = '';
  mobilidade = '';

  // Edição: já vem com o prontuário do paciente.
  @Input() set prontuarioInicial(p: { alergias: string; comorbidade: string; mobilidade: string } | undefined) {
    if (!p) return;
    this.alergias = p.alergias ?? '';
    this.comorbidade = p.comorbidade ?? '';
    this.mobilidade = p.mobilidade ?? '';
  }

  limpar() {
    this.alergias = '';
    this.comorbidade = '';
    this.mobilidade = '';
    this.erros = {};
  }
}
