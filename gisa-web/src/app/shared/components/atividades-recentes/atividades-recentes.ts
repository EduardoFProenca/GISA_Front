import { Component, Input } from '@angular/core';
import { Botao } from '../botao/botao';

export interface AcaoAtividade {
  label: string;
  icone?: string;
  acao: () => void;
}

export interface Atividade {
  descricao: string;
  tempoAtras: string;
  acoes?: AcaoAtividade[];
}

@Component({
  selector: 'app-atividades-recentes',
  imports: [Botao],
  templateUrl: './atividades-recentes.html',
  styleUrl: './atividades-recentes.scss'
})
export class AtividadesRecentes {
  @Input() atividades: Atividade[] = [];
  @Input() titulo = 'Atividades';
  @Input() vazio = 'Nenhuma atividade.';

}