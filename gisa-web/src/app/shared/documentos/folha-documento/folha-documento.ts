import { Component, Input, ViewEncapsulation } from '@angular/core';
import { INSTITUICAO } from '../instituicao';

export interface CampoIdentificacao {
  rotulo: string;
  valor: string;
}

export interface Assinatura {
  nome: string;
  // Linhas abaixo do nome (especialidade, registro no conselho, função...).
  detalhes: string[];
}

export interface DadosFolhaDocumento {
  titulo: string; // "Atestado", "Receita", "Declaração de Recusa"
  // Bloco de identificação acima do texto (ex.: paciente, CPF, nascimento). Pode ser vazio.
  identificacao: CampoIdentificacao[];
  // Texto livre; as quebras de linha digitadas são mantidas.
  texto: string;
  localData: string; // "Sorocaba, 13 de outubro de 2026."
  assinaturas: Assinatura[];
}

// Folha padrão dos documentos impressos, no timbrado da APAE. Estilos globais
// (ViewEncapsulation.None) porque a impressão precisa esconder o resto da página:
// ver folha-documento.scss (@media print). Para imprimir: window.print().
@Component({
  selector: 'app-folha-documento',
  imports: [],
  templateUrl: './folha-documento.html',
  styleUrl: './folha-documento.scss',
  encapsulation: ViewEncapsulation.None,
})
export class FolhaDocumento {
  @Input({ required: true }) dados!: DadosFolhaDocumento;
  readonly instituicao = INSTITUICAO;
}
