import { Component, Input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-atividades-recentes',
  styleUrl: './atividades-recentes.scss',
  templateUrl: './atividades-recentes.html',
})

export class AtividadesRecentes {
  @Input() atividades: Atividade[] = [];
}

export interface Atividade {
  descricao: string;
  tempoAtras: string;
}