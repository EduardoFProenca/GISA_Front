import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Botao } from '../botao/botao';
import { Dialogo } from '../dialogo/dialogo';

export interface EnderecoCompartilhadoItem {
  idEndereco: number;
  texto: string;
  outrosCadastros: number;
}

// 409 no PATCH: endereços alterados que também são de outros cadastros. Uma pergunta por endereço,
// sem resposta padrão (nenhuma das duas é segura) e sem nomes (LGPD: só a quantidade).
@Component({
  selector: 'app-dialogo-endereco-compartilhado',
  imports: [Botao, Dialogo],
  templateUrl: './dialogo-endereco-compartilhado.html',
  styleUrl: './dialogo-endereco-compartilhado.scss',
})
export class DialogoEnderecoCompartilhado {
  private _aberto = false;

  // Cada abertura começa sem respostas: a pergunta é sobre a alteração atual.
  @Input() set aberto(valor: boolean) {
    if (valor && !this._aberto) this.decisoes = new Map();
    this._aberto = valor;
  }
  get aberto(): boolean {
    return this._aberto;
  }

  @Input() itens: EnderecoCompartilhadoItem[] = [];
  @Output() confirmar = new EventEmitter<Map<number, boolean>>();
  @Output() cancelar = new EventEmitter<void>();

  decisoes = new Map<number, boolean>();

  get completo(): boolean {
    return this.itens.every((i) => this.decisoes.has(i.idEndereco));
  }

  escolher(idEndereco: number, alterarParaTodos: boolean) {
    this.decisoes.set(idEndereco, alterarParaTodos);
  }

  aoConfirmar() {
    if (this.completo) this.confirmar.emit(new Map(this.decisoes));
  }
}
