import { ChangeDetectionStrategy, Component, Input, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';
import { Contato } from '../../../../../shared/components/contato/contato';
import { GrauParentesco } from '../../../../../core/models/paciente.model';
import { ICONES } from '../../../../../shared/icons';
import { ROTULO_PARENTESCO } from '../../../../../shared/utils/rotulos.util';
import { EnderecoForm, ResponsavelItem } from '../../models/formularios-paciente';
import { PacienteValidadorService } from '../../services/paciente-validador';

export type { ResponsavelItem };


@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-info-responsavel',
  imports: [FormsModule, Contato],
  templateUrl: './info-responsavel.html',
  styleUrl: './info-responsavel.scss'
})
export class InfoResponsavel extends ComErros {
  private validador = inject(PacienteValidadorService);

  // Endereço do responsável que não reside com o paciente (só existe enquanto o cartão está aberto).
  @ViewChild(Contato) contatoResp?: Contato;

  readonly icones = ICONES;

  exibindoFormulario = false;
  indexEdicao: number | null = null; // índice do responsável em edição (null = novo)

  listaResponsaveis: ResponsavelItem[] = [];

  // Edição: responsáveis que o paciente já tem (clonados para não alterar o original).
  @Input() set responsaveisIniciais(lista: ResponsavelItem[] | undefined) {
    if (!lista) return;
    this.listaResponsaveis = lista.map((r) => ({ ...r, endereco: r.endereco ? { ...r.endereco } : null }));
  }
  novoResponsavel: ResponsavelItem = this.formVazio();
  errosCard: Record<string, string> = {};

  opcoesParentesco: { label: string; value: GrauParentesco }[] = [
    { label: 'Pai', value: 'PAI' },
    { label: 'Mãe', value: 'MAE' },
    { label: 'Avô / Avó', value: 'AVO' },
    { label: 'Tutor Legal', value: 'TUTOR_LEGAL' },
    { label: 'Outro', value: 'OUTRO' }
  ];

  formVazio(): ResponsavelItem {
    return {
      nome: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      estadoCivil: '',
      celular: '',
      ocupacao: '',
      grauParentesco: '',
      naoResideComPaciente: false,
      endereco: null,
    };
  }

  rotuloParentesco(grau: GrauParentesco | ''): string {
    return grau ? ROTULO_PARENTESCO[grau] : '';
  }

  limparErroCard(campo: string) {
    delete this.errosCard[campo];
  }

  abrirFormulario() {
    this.indexEdicao = null;
    this.novoResponsavel = this.formVazio();
    this.errosCard = {};
    this.exibindoFormulario = true;
    this.limparErro('responsaveis');
  }

  editarResponsavel(index: number) {
    const atual = this.listaResponsaveis[index];
    this.indexEdicao = index;
    // Clona para não alterar a lista antes de confirmar
    this.novoResponsavel = { ...atual, endereco: atual.endereco ? { ...atual.endereco } : null };
    this.errosCard = {};
    this.exibindoFormulario = true;
    this.limparErro('responsaveis');
  }

  aoMudarResidencia() {
    if (!this.novoResponsavel.naoResideComPaciente) this.novoResponsavel.endereco = null;
  }

  salvarResponsavel() {
    const r = this.novoResponsavel;
    const resultado = this.validador.validarResponsavel(r, this.contatoResp, this.listaResponsaveis, this.indexEdicao);
    this.errosCard = resultado.erros;
    if (!resultado.valido) return;

    const item: ResponsavelItem = {
      ...r,
      endereco: r.naoResideComPaciente && this.contatoResp ? this.enderecoDe(this.contatoResp) : null,
    };

    if (this.indexEdicao !== null) {
      this.listaResponsaveis[this.indexEdicao] = item;
    } else {
      this.listaResponsaveis.push(item);
    }

    this.limparErro('responsaveis');
    this.cancelarEdicao();
  }

  private enderecoDe(c: Contato): EnderecoForm {
    return {
      cep: c.cep,
      endereco: c.endereco,
      numero: c.numero,
      complemento: c.complemento,
      bairro: c.bairro,
      cidade: c.cidade,
      uf: c.uf,
    };
  }

  cancelarEdicao() {
    this.exibindoFormulario = false;
    this.indexEdicao = null;
    this.errosCard = {};
    this.novoResponsavel = this.formVazio();
  }

  removerResponsavel(index: number) {
    if (this.indexEdicao === index) {
      this.cancelarEdicao();
    }
    this.listaResponsaveis.splice(index, 1);
    this.limparErro('responsaveis');
  }

  limpar() {
    this.listaResponsaveis = [];
    this.cancelarEdicao();
    this.erros = {};
  }
}
