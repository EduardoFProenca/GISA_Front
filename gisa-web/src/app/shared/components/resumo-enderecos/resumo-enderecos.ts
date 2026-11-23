import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { Endereco } from '../../../core/models/comum.model';
import { formatarCep } from '../../utils/formatacao.util';
import { Botao } from '../botao/botao';
import { CampoDetalhe } from '../campo-detalhe/campo-detalhe';

const LIMITE_VISIVEL = 2;

// Resumo dos endereços de uma Pessoa nas telas de detalhe: até 2 de cada vez, "Ver mais" abre o resto.
// Não reordena: a API já devolve por idEndereco, e o primeiro é o principal.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-resumo-enderecos',
  imports: [Botao, CampoDetalhe],
  templateUrl: './resumo-enderecos.html',
  styleUrl: './resumo-enderecos.scss',
})
export class ResumoEnderecos {
  @Input({ required: true }) enderecos: Endereco[] = [];

  expandido = signal(false);
  readonly cep = formatarCep;

  get visiveis(): Endereco[] {
    return this.expandido() ? this.enderecos : this.enderecos.slice(0, LIMITE_VISIVEL);
  }

  get restantes(): number {
    return Math.max(0, this.enderecos.length - LIMITE_VISIVEL);
  }
}
