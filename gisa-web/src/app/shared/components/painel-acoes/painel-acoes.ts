import { RouterLink } from '@angular/router';
import { Component, Input } from '@angular/core';


export interface AcaoRapida {
  titulo: string;
  descricao: string;
  iconeSvg: string;
  rota: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-painel-acoes',
  styleUrl: './painel-acoes.scss',
  templateUrl: './painel-acoes.html',
})

export class PainelAcoesComponent {
  @Input() acoes: AcaoRapida[] = [];
}