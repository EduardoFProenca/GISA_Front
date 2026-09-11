import { RouterLink } from '@angular/router';
import { Component, Input } from '@angular/core';


export interface AcaoRapida {
  titulo: string;
  descricao: string;
  icone: string;
  rota: string;
}

@Component({
  imports: [],
  selector: 'app-painel-acoes',
  styleUrl: './painel-acoes.scss',
  templateUrl: './painel-acoes.html',
})

export class PainelAcoesComponent {
  @Input() acoes: AcaoRapida[] = [];
}