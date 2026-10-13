import { Component, Input, ViewEncapsulation } from '@angular/core';
import { INSTITUICAO } from './atestado.util';

export interface DadosFolhaAtestado {
  paragrafos: string[];
  localData: string; // "Sorocaba, 13 de outubro de 2026."
  emitente: { nome: string; especialidade: string; registro: string; cbo: string };
}

// Folha do atestado no timbrado da APAE Sorocaba. Estilos globais (ViewEncapsulation.None) porque a
// impressão precisa esconder o resto da página: ver atestado-folha.scss (@media print).
@Component({
  selector: 'app-atestado-folha',
  imports: [],
  templateUrl: './atestado-folha.html',
  styleUrl: './atestado-folha.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AtestadoFolha {
  @Input({ required: true }) dados!: DadosFolhaAtestado;
  readonly instituicao = INSTITUICAO;
}
