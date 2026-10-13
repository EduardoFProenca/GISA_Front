import { Component, Input } from '@angular/core';
import { ROTULO_PRESENCA } from '../../../../../shared/utils/rotulos.util';
import { dataCurta } from '../../../../../shared/utils/data.util';
import { Frequencia, FrequenciaMes, LIMITE_FREQUENCIA } from '../../frequencia.util';

// Aba 3 - Terapias e Programas Terapêuticos (CS06): presença acumulada do mês frente à regra dos 75%.
@Component({
  selector: 'app-aba-terapias',
  imports: [],
  templateUrl: './aba-terapias.html',
  styleUrl: './aba-terapias.scss',
})
export class AbaTerapias {
  @Input() frequencia: FrequenciaMes | null = null;
  @Input() carregando = false;
  @Input() erro = '';
  @Input() mesReferencia = '';

  readonly limite = LIMITE_FREQUENCIA;

  // Geral primeiro, depois uma linha por especialidade.
  get linhas(): Frequencia[] {
    return this.frequencia ? [this.frequencia.geral, ...this.frequencia.porEspecialidade] : [];
  }
  readonly rotuloPresenca = ROTULO_PRESENCA;
  readonly dataCurta = dataCurta;
}
