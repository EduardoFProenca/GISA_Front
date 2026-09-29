import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { GrauParentesco } from '../../../../../core/models/paciente.model';

export interface ResponsavelItem {
  nome: string;
  cpf: string;
  telefone: string;
  ocupacao: string;
  grauParentesco: GrauParentesco | '';
}

@Component({
  selector: 'app-info-responsavel',
  imports: [CommonModule, FormsModule],
  templateUrl: './info-responsavel.html',
  styleUrl: './info-responsavel.scss'
})
export class InfoResponsavel {
  exibindoFormulario: boolean = false;
  indexEdicao: number | null = null; // Guarda o índice do responsável sendo editado (null = novo)

  // Lista de responsáveis salvos nas "caixinhas"
  listaResponsaveis: ResponsavelItem[] = [];

  // Form temporário
  novoResponsavel: ResponsavelItem = this.getFormVazio();

  opcoesParentesco: { label: string; value: GrauParentesco }[] = [
    { label: 'Pai', value: 'PAI' },
    { label: 'Mãe', value: 'MAE' },
    { label: 'Avô / Avó', value: 'AVO' },
    { label: 'Tio / Tia', value: 'TIO' },
    { label: 'Irmão / Irmã', value: 'IRMAO' },
    { label: 'Tutor Legal', value: 'TUTOR_LEGAL' },
    { label: 'Outro', value: 'OUTRO' }
  ];

  getFormVazio(): ResponsavelItem {
    return {
      nome: '',
      cpf: '',
      telefone: '',
      ocupacao: '',
      grauParentesco: ''
    };
  }

  abrirFormulario() {
    this.indexEdicao = null;
    this.novoResponsavel = this.getFormVazio();
    this.exibindoFormulario = true;
  }

  editarResponsavel(index: number) {
    this.indexEdicao = index;
    // Clona o objeto para não alterar diretamente na lista antes de confirmar
    this.novoResponsavel = { ...this.listaResponsaveis[index] };
    this.exibindoFormulario = true;
  }

  salvarResponsavel() {
    if (!this.novoResponsavel.nome.trim() || !this.novoResponsavel.cpf.trim()) {
      alert('Preencha ao menos Nome e CPF do responsável.');
      return;
    }

    if (this.indexEdicao !== null) {
      // Atualiza o responsável existente
      this.listaResponsaveis[this.indexEdicao] = { ...this.novoResponsavel };
    } else {
      // Adiciona um novo
      this.listaResponsaveis.push({ ...this.novoResponsavel });
    }

    this.cancelarEdicao();
  }

  cancelarEdicao() {
    this.exibindoFormulario = false;
    this.indexEdicao = null;
    this.novoResponsavel = this.getFormVazio();
  }

  removerResponsavel(index: number) {
    if (this.indexEdicao === index) {
      this.cancelarEdicao();
    }
    this.listaResponsaveis.splice(index, 1);
  }
}