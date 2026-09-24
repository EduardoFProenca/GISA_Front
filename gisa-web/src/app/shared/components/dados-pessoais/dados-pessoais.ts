import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-dados-pessoais',
  imports: [FormsModule],
  templateUrl: './dados-pessoais.html',
  styleUrl: './dados-pessoais.scss',
})
export class DadosPessoais implements OnInit {
  @Input() dadosIniciais?: Partial<DadosPessoaisValor>;
  @Input() bloquearCpfSexoNascimento: boolean = false;
  @Input() somenteLeitura: boolean = false;

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