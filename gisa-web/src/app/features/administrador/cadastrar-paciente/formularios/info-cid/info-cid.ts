import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CidItem {
  codigoCID: string;
  descricao: string;
}

@Component({
  selector: 'app-info-cid',
  imports: [CommonModule, FormsModule],
  templateUrl: './info-cid.html',
  styleUrl: './info-cid.scss'
})
export class InfoCid {
  cidSelecionado = {
    codigoCID: '',
    descricao: ''
  };

  listaCidsSelecionados: CidItem[] = [];

  cidsOpcoes = [
    { codigoCID: 'F84.0', descricao: 'Autismo Infantil' },
    { codigoCID: 'G80.0', descricao: 'Paralisia Cerebral Espástica' },
    { codigoCID: 'Q90', descricao: 'Síndrome de Down' },
    { codigoCID: 'F80.1', descricao: 'Distúrbio Expressivo de Linguagem' }
  ];

  adicionarCid() {
    if (!this.cidSelecionado.codigoCID) return;

    // Busca a opção selecionada para pegar a descrição oficial do CID
    const opcao = this.cidsOpcoes.find(c => c.codigoCID === this.cidSelecionado.codigoCID);
    const descricaoOficial = opcao ? opcao.descricao : '';
    const observacaoDigitada = this.cidSelecionado.descricao.trim();

    // Se o usuário digitou uma observação, combina a descrição oficial + observação
    let descricaoFinal = descricaoOficial;
    if (observacaoDigitada) {
      descricaoFinal = `${descricaoOficial} (${observacaoDigitada})`;
    }

    this.listaCidsSelecionados.push({
      codigoCID: this.cidSelecionado.codigoCID,
      descricao: descricaoFinal
    });

    // Limpa os campos para a próxima seleção
    this.cidSelecionado = { codigoCID: '', descricao: '' };
  }

  removerCid(index: number) {
    this.listaCidsSelecionados.splice(index, 1);
  }
}