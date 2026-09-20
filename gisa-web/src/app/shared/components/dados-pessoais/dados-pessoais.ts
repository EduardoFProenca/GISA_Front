// shared/components/dados-pessoais/dados-pessoais.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dados-pessoais',
  imports: [FormsModule],
  templateUrl: './dados-pessoais.html',
  styleUrl: './dados-pessoais.scss',
})
export class DadosPessoais {
  nome: string = '';
  cpf: string = '';
  rg: string = '';
  dataNascimento: string = '';
  sexo: string = '';
  celular: string = '';
  estadoCivil: string = '';
  numCNS: string = '';
}