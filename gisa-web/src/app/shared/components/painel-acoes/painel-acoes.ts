import { Component, Input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';

export interface AcaoRapida {
  titulo: string;
  descricao: string;
  icone: string;
  rota: string;
}

@Component({
  selector: 'app-painel-acoes',
  imports: [NgIcon, RouterLink, ],
  templateUrl: './painel-acoes.html',
  styleUrl: './painel-acoes.scss'
})
export class PainelAcoesComponent {
  @Input() titulo: string = 'Gestão Rápida';
  @Input() acoes: AcaoRapida[] = [];
  
}