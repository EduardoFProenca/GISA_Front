import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ResponsavelItem } from '../../models/formularios-paciente';

// "Quem mora aqui:" no card de um endereço do paciente (só com 2 ou mais endereços).
// Altera a `residencia` do próprio item do responsável: a lista de responsáveis é a fonte da verdade.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-quem-mora-aqui',
  templateUrl: './quem-mora-aqui.html',
  styleUrl: './quem-mora-aqui.scss',
})
export class QuemMoraAqui {
  @Input({ required: true }) chave!: string;
  @Input({ required: true }) residentes: ResponsavelItem[] = [];

  alternar(r: ResponsavelItem, marcado: boolean) {
    const sem = r.residencia.filter((c) => c !== this.chave);
    r.residencia = marcado ? [...sem, this.chave] : sem;
  }
}
