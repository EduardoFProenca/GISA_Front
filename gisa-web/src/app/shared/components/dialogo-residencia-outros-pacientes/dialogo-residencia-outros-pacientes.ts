import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Botao } from '../botao/botao';
import { Dialogo } from '../dialogo/dialogo';

export interface ResidenciaOutrosPacientesItem {
  idResponsavel: number;
  nome: string;
  outrosPacientes: number;
}

// 409 no salvamento do paciente: responsável que passa a residir e ainda mora com outros pacientes.
// Uma pergunta por responsável, sem resposta padrão (D12) e sem nomes de outros pacientes (LGPD).
@Component({
  selector: 'app-dialogo-residencia-outros-pacientes',
  imports: [Botao, Dialogo],
  templateUrl: './dialogo-residencia-outros-pacientes.html',
  styleUrl: './dialogo-residencia-outros-pacientes.scss',
})
export class DialogoResidenciaOutrosPacientes {
  private _aberto = false;

  // Cada abertura começa sem respostas: a pergunta é sobre o salvamento atual.
  @Input() set aberto(valor: boolean) {
    if (valor && !this._aberto) this.decisoes = new Map();
    this._aberto = valor;
  }
  get aberto(): boolean {
    return this._aberto;
  }

  @Input() itens: ResidenciaOutrosPacientesItem[] = [];
  // idResponsavel -> continua morando com os outros pacientes
  @Output() confirmar = new EventEmitter<Map<number, boolean>>();
  @Output() cancelar = new EventEmitter<void>();

  decisoes = new Map<number, boolean>();

  get completo(): boolean {
    return this.itens.every((i) => this.decisoes.has(i.idResponsavel));
  }

  escolher(idResponsavel: number, continua: boolean) {
    this.decisoes.set(idResponsavel, continua);
  }

  aoConfirmar() {
    if (this.completo) this.confirmar.emit(new Map(this.decisoes));
  }
}
