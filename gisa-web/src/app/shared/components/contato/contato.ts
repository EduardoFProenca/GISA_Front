import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../com-erros';

@Component({
  selector: 'app-contato',
  imports: [FormsModule],
  templateUrl: './contato.html',
  styleUrl: './contato.scss',
})
export class Contato extends ComErros implements OnInit {
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

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
  }
}