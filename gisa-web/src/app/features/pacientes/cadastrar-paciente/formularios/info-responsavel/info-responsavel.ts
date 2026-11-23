import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { Mascara } from '../../../../../shared/directives/mascara.directive';
import { ComErros } from '../../../../../shared/components/com-erros';
import { Contato } from '../../../../../shared/components/contato/contato';
import type { ListaEnderecos } from '../../../../../shared/components/lista-enderecos/lista-enderecos';
import { ConfirmDialog } from '../../../../../shared/components/confirm-dialog/confirm-dialog';
import { SelectBusca } from '../../../../../shared/components/select-busca/select-busca';
import { SelectMenu } from '../../../../../shared/components/select-menu/select-menu';
import {
  DICA_BUSCA_RESPONSAVEL,
  MINIMO_BUSCA_RESPONSAVEL,
  buscaResponsaveis,
} from '../../../../../shared/components/select-busca/buscas';
import { GrauParentesco, ResponsavelResumo } from '../../../../../core/models/paciente.model';
import { ResponsavelService } from '../../../../../core/services/responsavel';
import { mensagemDeErro } from '../../../../../core/http/erro-api';
import { ICONES } from '../../../../../shared/icons';
import { ROTULO_PARENTESCO } from '../../../../../shared/utils/rotulos.util';
import { soDigitos } from '../../../../../shared/utils/texto.util';
import { hojeIso } from '../../../../../shared/utils/data.util';
import { ContatoForm, EnderecoForm, ResponsavelItem } from '../../models/formularios-paciente';
import { PacienteValidadorService } from '../../services/paciente-validador';
import { Filtro } from '../../../../../shared/directives/filtro.directive';
import {
  enderecoEmTexto,
  enderecoVazio,
  ajustarResidencia,
  mesmoEnderecoForm,
  responsavelReaproveitado,
  sugerirResidencia,
} from '../../../paciente-form.util';
import { Botao } from '../../../../../shared/components/botao/botao';

export type { ResponsavelItem };

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-info-responsavel',
  imports: [Botao, NgIcon, FormsModule, Mascara, Contato, ConfirmDialog, SelectBusca, SelectMenu, Filtro],
  templateUrl: './info-responsavel.html',
  styleUrl: './info-responsavel.scss'
})
export class InfoResponsavel extends ComErros {
  private validador = inject(PacienteValidadorService);
  private responsavelService = inject(ResponsavelService);
  private cdr = inject(ChangeDetectorRef);
  readonly hoje = hojeIso();

  // Endereço do responsável que não reside com o paciente (só existe enquanto o cartão está aberto).
  @ViewChild(Contato) contatoResp?: Contato;

  // Endereços do paciente: recebem o do responsável já cadastrado que reside com ele.
  @Input() enderecosPaciente?: ListaEnderecos;

  readonly icones = ICONES;
  readonly enderecoEmTexto = enderecoEmTexto;
  readonly buscarResponsaveis = buscaResponsaveis(this.responsavelService, {
    minimoCaracteres: MINIMO_BUSCA_RESPONSAVEL,
  });
  readonly dicaBuscaResponsavel = DICA_BUSCA_RESPONSAVEL;

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
  nomeResponsavelEndereco = '';
  enderecoConfirmacao: EnderecoForm | null = null;

  // Endereço do paciente copiado de um responsável (diálogo "Usar este endereço também para o paciente?").
  // Serve para perguntar, ao remover esse responsável, se o endereço sai junto. `chave` = item da lista.
  origemEnderecoPaciente: { cpf: string; nome: string; endereco: EnderecoForm; chave: string } | null = null;

  // Remoção pendente enquanto a pergunta está aberta.
  remocaoPendente: number | null = null;

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
      residencia: [],
      endereco: null,
    };
  }

  private clonar(r: ResponsavelItem): ResponsavelItem {
    return {
      ...r,
      residencia: [...(r.residencia ?? [])],
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

  // O texto do campo Nome (busca) é o nome do responsável novo; escolher na lista é outro caminho (usarExistente).
  aoDigitarNome(texto: string) {
    this.novoResponsavel.nome = texto;
    this.limparErroCard('nome');
    this.limparErroCard('busca');
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
    // Mostra o endereço que o responsável já tem (o de quem foi reaproveitado não muda aqui), menos quando
    // é um endereço do paciente: esse era o compartilhado, e quem não reside não fica com ele (D1).
    else if (r.enderecoCadastro && !r.endereco && !this.ehEnderecoDoPaciente(r.enderecoCadastro)) {
      r.endereco = { ...r.enderecoCadastro };
    }
  }

  salvarResponsavel() {
    const r = this.novoResponsavel;
    const resultado = this.validador.validarResponsavel(
      r, this.contatoResp, this.listaResponsaveis, this.indexEdicao, this.enderecosPaciente?.itens ?? []
    );
    this.errosCard = resultado.erros;
    if (!resultado.valido) return;

    const item: ResponsavelItem = { ...r, endereco: this.enderecoDoItem(r) };

    // Quem passa a residir com o paciente e já tem endereço cadastrado precisa ter um dos endereços dele.
    // Se o paciente ainda não tem endereço, pode usar o do responsável; se não tem esse, o responsável
    // fica como "não reside" (o endereço dele só muda no cadastro do responsável).
    const endereco = this.enderecoQueOPacienteRecebe(item);
    const lista = this.enderecosPaciente;
    if (endereco && lista) {
      const conflito = this.outroQueResideEmOutroEndereco(endereco);
      if (conflito) {
        this.errosCard['residencia'] =
          `${conflito.nome.trim()} também reside com o paciente, mas em outro endereço. ` +
          'Marque qual dos dois não reside com o paciente.';
        return;
      }
      if (!lista.itens.length) {
        this.nomeResponsavelEndereco = item.nome.trim();
        this.enderecoConfirmacao = endereco;
        this.confirmarEnderecoAberto = true;
        return;
      }
      if (!lista.itens.some((i) => mesmoEnderecoForm(i, endereco))) {
        this.errosCard['residencia'] =
          `${item.nome.trim()} já tem outro endereço cadastrado (${enderecoEmTexto(endereco)}). ` +
          'Marque "Responsável não reside com o paciente". O endereço do responsável é alterado no cadastro dele.';
        return;
      }
    }

    this.confirmarItem(item);
  }

  confirmarTrocaEndereco() {
    this.confirmarEnderecoAberto = false;
    const item: ResponsavelItem = { ...this.novoResponsavel, endereco: null };
    const adicionado = this.enderecosPaciente?.adicionar({ ...item.enderecoCadastro! });
    this.origemEnderecoPaciente = adicionado ? this.origemDe(item, adicionado.chave) : null;
    this.confirmarItem(item);
  }

  private origemDe(r: ResponsavelItem, chave: string) {
    return { cpf: soDigitos(r.cpf), nome: r.nome.trim(), endereco: { ...r.enderecoCadastro! }, chave };
  }

  cancelarTrocaEndereco() {
    this.confirmarEnderecoAberto = false;
  }

  private confirmarItem(item: ResponsavelItem) {
    // A origem passou a "não reside": o endereço fica com o paciente, sem perguntar ao remover.
    if (item.naoResideComPaciente && soDigitos(item.cpf) === this.origemEnderecoPaciente?.cpf) {
      this.origemEnderecoPaciente = null;
    }
    const enderecos = this.enderecosPaciente?.itens ?? [];
    if (item.naoResideComPaciente) {
      item.residencia = [];
    } else {
      item.residencia = (item.residencia ?? []).filter((c) => enderecos.some((e) => e.chave === c));
      // Só sugere para quem está sem endereço marcado: editar o telefone não apaga a escolha feita.
      if (enderecos.length >= 2 && !item.residencia.length) {
        const outros = this.listaResponsaveis.filter((_, i) => i !== this.indexEdicao);
        item.residencia = sugerirResidencia(item, outros, enderecos);
      }
    }
    if (this.indexEdicao !== null) {
      this.listaResponsaveis[this.indexEdicao] = item;
    } else {
      this.listaResponsaveis.push(item);
    }
    ajustarResidencia(this.listaResponsaveis, enderecos);

    this.limparErro('responsaveis');
    this.cancelarEdicao();
  }

  private ehEnderecoDoPaciente(e: EnderecoForm): boolean {
    return (this.enderecosPaciente?.itens ?? []).some((i) => mesmoEnderecoForm(i, e));
  }

  // "rua, nº" dos endereços em que ele mora; vazio com menos de 2 endereços (aí todos moram no único).
  moraEm(r: ResponsavelItem): string {
    const itens = this.enderecosPaciente?.itens ?? [];
    if (itens.length < 2 || r.naoResideComPaciente) return '';
    return itens.filter((e) => r.residencia.includes(e.chave)).map((e) => `${e.endereco}, ${e.numero}`).join('; ');
  }

  private enderecoDoItem(r: ResponsavelItem): EnderecoForm | null {
    if (!r.naoResideComPaciente) return null;
    if (r.reaproveitado && r.enderecoCadastro) return { ...r.enderecoCadastro };
    const endereco = this.contatoResp ? this.enderecoDe(this.contatoResp) : null;
    return endereco && !enderecoVazio(endereco) ? endereco : null;
  }

  // Endereço já cadastrado de quem passa a residir com o paciente agora (quem já residia acompanha o
  // paciente e não entra aqui).
  private enderecoQueOPacienteRecebe(r: ResponsavelItem): EnderecoForm | null {
    return !r.naoResideComPaciente && !r.resideAntes && r.enderecoCadastro ? r.enderecoCadastro : null;
  }

  private outroQueResideEmOutroEndereco(endereco: EnderecoForm): ResponsavelItem | undefined {
    return this.listaResponsaveis.find((x, i) => {
      if (i === this.indexEdicao) return false;
      const dele = this.enderecoQueOPacienteRecebe(x);
      return !!dele && !mesmoEnderecoForm(dele, endereco);
    });
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
    const r = this.listaResponsaveis[index];
    const origem = this.origemEnderecoPaciente;
    if (!origem || soDigitos(r.cpf) !== origem.cpf) {
      this.removerDaLista(index);
      return;
    }

    // O endereço saiu da lista ou foi alterado à mão depois da cópia: passou a ser do paciente.
    const copiado = this.enderecosPaciente?.itens.find((i) => i.chave === origem.chave);
    if (!copiado || !mesmoEnderecoForm(copiado, origem.endereco)) {
      this.origemEnderecoPaciente = null;
      this.removerDaLista(index);
      return;
    }

    // Outro responsável também mora nesse endereço com o paciente: o endereço continua valendo.
    const outro = this.listaResponsaveis.find(
      (x, i) => i !== index && !x.naoResideComPaciente && !!x.enderecoCadastro && mesmoEnderecoForm(x.enderecoCadastro, copiado)
    );
    if (outro) {
      this.origemEnderecoPaciente = this.origemDe(outro, origem.chave);
      this.removerDaLista(index);
      return;
    }

    this.remocaoPendente = index; // o diálogo decide
  }

  confirmarRemocaoEndereco() {
    this.concluirRemocao(true);
  }

  manterEnderecoNaRemocao() {
    this.concluirRemocao(false);
  }

  private concluirRemocao(limparEndereco: boolean) {
    const index = this.remocaoPendente;
    this.remocaoPendente = null;
    if (index === null) return;
    const origem = this.origemEnderecoPaciente;
    if (limparEndereco && origem) this.enderecosPaciente?.remover(origem.chave);
    this.origemEnderecoPaciente = null;
    this.removerDaLista(index);
  }

  private removerDaLista(index: number) {
    if (this.indexEdicao === index) {
      this.cancelarEdicao();
    }
    this.listaResponsaveis.splice(index, 1);
    // Quem está em edição abaixo do removido sobe uma posição.
    if (this.indexEdicao !== null && index < this.indexEdicao) this.indexEdicao--;
    ajustarResidencia(this.listaResponsaveis, this.enderecosPaciente?.itens ?? []);
    this.limparErro('responsaveis');
  }

  limpar() {
    this.origemEnderecoPaciente = null;
    this.remocaoPendente = null;
    this.listaResponsaveis = [];
    this.cancelarEdicao();
    this.erros = {};
  }
}
