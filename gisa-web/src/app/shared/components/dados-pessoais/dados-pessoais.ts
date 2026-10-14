import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mascara } from '../../directives/mascara.directive';
import { ComErros } from '../com-erros';

export interface DadosPessoaisValor {
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  sexo: string;
  celular: string;
  estadoCivil: string;
  numCNS: string;
}

// Eager: os erros (ComErros) chegam depois da resposta da API e precisam aparecer.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-dados-pessoais',
  imports: [FormsModule, Mascara],
  templateUrl: './dados-pessoais.html',
  styleUrl: './dados-pessoais.scss',
})
export class DadosPessoais extends ComErros implements OnInit {
  @Input() dadosIniciais?: Partial<DadosPessoaisValor>;
  @Input() bloquearCpfSexoNascimento: boolean = false;
  @Input() somenteLeitura: boolean = false;
  // Paciente não tem e-mail e o celular dele é opcional (ver API de pacientes).
  @Input() exibirEmail: boolean = true;
  @Input() celularObrigatorio: boolean = true;

  nome: string = '';
  cpf: string = '';
  email: string = '';
  dataNascimento: string = '';
  sexo: string = '';
  celular: string = '';
  estadoCivil: string = '';
  numCNS: string = '';

  ngOnInit() {
    if (this.dadosIniciais) {
      Object.assign(this, this.dadosIniciais);
    }
  }
}