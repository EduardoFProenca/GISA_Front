import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mascara } from '../../directives/mascara.directive';
import { ComErros } from '../com-erros';
import { CepService } from '../../../core/services/cep';
import { soDigitos } from '../../utils/texto.util';

// Eager: os erros (ComErros) chegam depois da resposta da API e precisam aparecer.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-contato',
  imports: [FormsModule, Mascara],
  templateUrl: './contato.html',
  styleUrl: './contato.scss',
})
export class Contato extends ComErros implements OnInit {
  private cepService = inject(CepService);
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() dadosIniciais?: Partial<Contato>;
  @Input() somenteLeitura: boolean = false;
  @Input() titulo: string = 'Endereço e Contato';
  @Input() subtitulo: string = 'Localização e formas de contato';

  readonly ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  cep: string = '';
  endereco: string = '';
  numero: string = '';
  complemento: string = '';
  bairro: string = '';
  cidade: string = '';
  uf: string = '';

  // Busca do endereço pelo CEP
  buscandoCep = signal(false);
  avisoCep = signal('');
  private ultimoCepBuscado = '';

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
    // O CEP que já veio preenchido (edição) não dispara busca.
    this.ultimoCepBuscado = soDigitos(this.cep);
  }

  // Ao completar os 8 dígitos, preenche rua, bairro, cidade e UF (o número fica com o usuário).
  aoMudarCep() {
    this.limparErro('cep');
    const cep = soDigitos(this.cep);
    if (cep.length !== 8) {
      this.avisoCep.set('');
      return;
    }
    if (cep === this.ultimoCepBuscado) return;
    this.ultimoCepBuscado = cep;

    this.buscandoCep.set(true);
    this.avisoCep.set('');
    this.cepService.buscar(cep).subscribe((achado) => {
      this.buscandoCep.set(false);
      if (soDigitos(this.cep) !== cep) return; // o usuário já mudou o CEP
      if (!achado) {
        this.avisoCep.set('CEP não encontrado. Preencha o endereço manualmente.');
        return;
      }
      if (achado.rua) this.endereco = achado.rua;
      if (achado.bairro) this.bairro = achado.bairro;
      if (achado.cidade) this.cidade = achado.cidade;
      if (achado.uf) this.uf = achado.uf;
      for (const campo of ['endereco', 'bairro', 'cidade', 'uf']) this.limparErro(campo);
      // Próximo campo a preencher: rua (quando o CEP é geral da cidade) ou número.
      setTimeout(() => this.elemento.nativeElement.querySelector<HTMLInputElement>(achado.rua ? '#numero' : '#endereco')?.focus());
    });
  }
}