import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { Mascara } from '../../../../../shared/directives/mascara.directive';
import { ComErros } from '../../../../../shared/components/com-erros';
import { Contato } from '../../../../../shared/components/contato/contato';
import { ConfirmDialog } from '../../../../../shared/components/confirm-dialog/confirm-dialog';
import { SelectBusca } from '../../../../../shared/components/select-busca/select-busca';
import { buscaResponsaveis } from '../../../../../shared/components/select-busca/buscas';
import { GrauParentesco, ResponsavelResumo } from '../../../../../core/models/paciente.model';
import { ResponsavelService } from '../../../../../core/services/responsavel';
import { mensagemDeErro } from '../../../../../core/http/erro-api';
import { ICONES } from '../../../../../shared/icons';
import { ROTULO_PARENTESCO } from '../../../../../shared/utils/rotulos.util';
import { soDigitos } from '../../../../../shared/utils/texto.util';
import { ContatoForm, EnderecoForm, ResponsavelItem } from '../../models/formularios-paciente';
import { PacienteValidadorService } from '../../services/paciente-validador';
import {
  enderecoEmTexto,
  enderecoVazio,
  mesmoEnderecoForm,
  responsavelReaproveitado,
} from '../../../paciente-form.util';

export type { ResponsavelItem };


@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-info-responsavel',
  imports: [NgIcon, FormsModule, Mascara, Contato, ConfirmDialog, SelectBusca],
  templateUrl: './info-responsavel.html',
  styleUrl: './info-responsavel.scss'
})
export class InfoResponsavel extends ComErros {
  private validador = inject(PacienteValidadorService);
  private responsavelService = inject(ResponsavelService);
  private cdr = inject(ChangeDetectorRef);

  // Endereço do responsável que não reside com o paciente (só existe enquanto o cartão está aberto).
  @ViewChild(Contato) contatoResp?: Contato;

  // Endereço do paciente: recebe o do responsável já cadastrado que reside com ele.
  @Input() contatoPaciente?: ContatoForm;

  readonly icones = ICONES;
  readonly enderecoEmTexto = enderecoEmTexto;
  readonly buscarResponsaveis = buscaResponsaveis(this.responsavelService);

  exibindoFormulario = false;
  indexEdicao: number | null = null; // índice do responsável em edição (null = novo)

  listaResponsaveis: ResponsavelItem[] = [];

  // Edição: responsáveis que o paciente já tem (clonados para não alterar o original).
  @Input() set responsaveisIniciais(lista: ResponsavelItem[] | undefined) {
    if (!lista) return;
    this.listaResponsaveis = lista.map((r) => this.clonar(r));
  }
  novoResponsavel: ResponsavelItem = this.formVazio();
  errosCard: Record<string, string> = {};

  // Busca de responsável já cadastrado
  carregandoExistente = false;
  // CPF digitado que já pertence a um responsável cadastrado (oferece usar o cadastro).
  cpfJaCadastrado: ResponsavelResumo | null = null;
  private ultimoCpfConsultado = '';

  // Pergunta antes de trocar o endereço do paciente pelo do responsável.
  confirmarEnderecoAberto = false;
  mensagemEndereco = '';

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

  private clonar(r: ResponsavelItem): ResponsavelItem {
    return {
      ...r,
      endereco: r.endereco ? { ...r.endereco } : null,
      enderecoCadastro: r.enderecoCadastro ? { ...r.enderecoCadastro } : r.enderecoCadastro,
    };
  }

  // Ids já na lista (não aparecem na busca), exceto o que está sendo editado.
  get idsNaLista(): number[] {
    return this.listaResponsaveis
      .filter((r, i) => i !== this.indexEdicao && r.idResponsavel)
      .map((r) => r.idResponsavel!);
  }

  // Responsável já vinculado (edição do paciente): os dados dele valem para todos os pacientes dele.
  get vinculadoAntes(): boolean {
    return !!this.novoResponsavel.idResponsavel && !this.novoResponsavel.reaproveitado;
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
    this.cpfJaCadastrado = null;
    this.ultimoCpfConsultado = '';
    this.exibindoFormulario = true;
    this.limparErro('responsaveis');
  }

  editarResponsavel(index: number) {
    this.indexEdicao = index;
    // Clona para não alterar a lista antes de confirmar
    this.novoResponsavel = this.clonar(this.listaResponsaveis[index]);
    this.errosCard = {};
    this.cpfJaCadastrado = null;
    this.exibindoFormulario = true;
    this.limparErro('responsaveis');
  }

  // CPF completo num cadastro novo: confere se já existe responsável com ele.
  aoMudarCpf() {
    this.limparErroCard('cpf');
    const cpf = soDigitos(this.novoResponsavel.cpf);
    if (cpf.length !== 11) {
      this.cpfJaCadastrado = null;
      this.ultimoCpfConsultado = '';
      return;
    }
    if (cpf === this.ultimoCpfConsultado || this.novoResponsavel.idResponsavel) return;
    this.ultimoCpfConsultado = cpf;

    this.responsavelService.listar({ cpf, size: 1 }).subscribe({
      next: ({ content }) => {
        if (soDigitos(this.novoResponsavel.cpf) !== cpf) return; // o usuário já mudou o CPF
        const achado = content.find((r) => r.cpf === cpf) ?? null;
        this.cpfJaCadastrado = achado && !this.idsNaLista.includes(achado.idCadastro) ? achado : null;
        this.cdr.markForCheck();
      },
    });
  }

  // Preenche o cartão com um responsável já cadastrado (escolhido na busca ou pelo CPF).
  usarExistente(id: number | string | null) {
    if (id === null) return;
    this.carregandoExistente = true;
    this.cpfJaCadastrado = null;
    this.errosCard = {};

    this.responsavelService.buscar(Number(id)).subscribe({
      next: (r) => {
        this.carregandoExistente = false;
        this.novoResponsavel = responsavelReaproveitado(r, this.novoResponsavel.grauParentesco);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.carregandoExistente = false;
        this.errosCard['busca'] = mensagemDeErro(err, 'Não foi possível carregar o responsável.');
        this.cdr.markForCheck();
      },
    });
  }

  // Volta ao cadastro de um responsável novo (mantém só o grau de parentesco).
  desfazerSelecao() {
    const grau = this.novoResponsavel.grauParentesco;
    this.novoResponsavel = { ...this.formVazio(), grauParentesco: grau };
    this.ultimoCpfConsultado = '';
    this.errosCard = {};
  }

  aoMudarResidencia() {
    const r = this.novoResponsavel;
    this.limparErroCard('residencia');
    if (!r.naoResideComPaciente) r.endereco = null;
    // O endereço de um responsável já cadastrado não muda aqui: mostra o que ele tem.
    else if (r.reaproveitado && r.enderecoCadastro) r.endereco = { ...r.enderecoCadastro };
  }

  salvarResponsavel() {
    const r = this.novoResponsavel;
    const resultado = this.validador.validarResponsavel(r, this.contatoResp, this.listaResponsaveis, this.indexEdicao);
    this.errosCard = resultado.erros;
    if (!resultado.valido) return;

    const item: ResponsavelItem = { ...r, endereco: this.enderecoDoItem(r) };

    // Responsável já cadastrado que reside com o paciente: o paciente passa a usar o endereço dele.
    const endereco = this.enderecoQueOPacienteRecebe(item);
    if (endereco) {
      const conflito = this.outroQueResideEmOutroEndereco(endereco);
      if (conflito) {
        this.errosCard['residencia'] =
          `${conflito.nome.trim()} também reside com o paciente, mas em outro endereço. ` +
          'Marque qual dos dois não reside com o paciente.';
        return;
      }
      const paciente = this.contatoPaciente;
      if (paciente && !enderecoVazio(paciente) && !mesmoEnderecoForm(paciente, endereco)) {
        this.mensagemEndereco =
          `${item.nome.trim()} mora em ${enderecoEmTexto(endereco)}, diferente do endereço informado para o paciente. ` +
          'Usar este endereço também para o paciente? Se o responsável não mora com ele, volte e marque ' +
          '"Responsável não reside com o paciente".';
        this.confirmarEnderecoAberto = true;
        return;
      }
      this.aplicarEnderecoNoPaciente(endereco);
    }

    this.confirmarItem(item);
  }

  confirmarTrocaEndereco() {
    this.confirmarEnderecoAberto = false;
    const item: ResponsavelItem = { ...this.novoResponsavel, endereco: null };
    this.aplicarEnderecoNoPaciente(item.enderecoCadastro!);
    this.confirmarItem(item);
  }

  cancelarTrocaEndereco() {
    this.confirmarEnderecoAberto = false;
  }

  private confirmarItem(item: ResponsavelItem) {
    if (this.indexEdicao !== null) {
      this.listaResponsaveis[this.indexEdicao] = item;
    } else {
      this.listaResponsaveis.push(item);
    }

    this.limparErro('responsaveis');
    this.cancelarEdicao();
  }

  private enderecoDoItem(r: ResponsavelItem): EnderecoForm | null {
    if (!r.naoResideComPaciente) return null;
    if (r.reaproveitado && r.enderecoCadastro) return { ...r.enderecoCadastro };
    return this.contatoResp ? this.enderecoDe(this.contatoResp) : null;
  }

  private enderecoQueOPacienteRecebe(r: ResponsavelItem): EnderecoForm | null {
    return r.reaproveitado && !r.naoResideComPaciente && r.enderecoCadastro ? r.enderecoCadastro : null;
  }

  private outroQueResideEmOutroEndereco(endereco: EnderecoForm): ResponsavelItem | undefined {
    return this.listaResponsaveis.find((x, i) => {
      if (i === this.indexEdicao) return false;
      const dele = this.enderecoQueOPacienteRecebe(x);
      return !!dele && !mesmoEnderecoForm(dele, endereco);
    });
  }

  private aplicarEnderecoNoPaciente(e: EnderecoForm) {
    const c = this.contatoPaciente;
    if (!c) return;
    Object.assign(c, { ...e });
    for (const campo of ['cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'uf']) delete c.erros[campo];
  }

  private enderecoDe(c: ContatoForm): EnderecoForm {
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
    this.cpfJaCadastrado = null;
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
