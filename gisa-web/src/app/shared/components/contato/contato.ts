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