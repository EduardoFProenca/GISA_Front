import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { Mascara } from '../../../../../shared/directives/mascara.directive';
import { ComErros } from '../../../../../shared/components/com-erros';
import { Contato } from '../../../../../shared/components/contato/contato';
import type { ListaEnderecos } from '../../../../../shared/components/lista-enderecos/lista-enderecos';
import { ConfirmDialog } from '../../../../../shared/components/confirm-dialog/confirm-dialog';
import { Dialogo } from '../../../../../shared/components/dialogo/dialogo';
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

interface OrigemEndereco {
  cpf: string;
  nome: string;
  chave: string;
  // Valor na hora da cópia: alterado depois, o endereço passou a ser do paciente.
  endereco: EnderecoForm;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-info-responsavel',
  imports: [Botao, NgIcon, FormsModule, Mascara, Contato, ConfirmDialog, Dialogo, SelectBusca, SelectMenu, Filtro],
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
  // Responsável que reside com endereço fora da lista do paciente: três saídas (adicionar, morar, não reside).
  enderecoDiferenteAberto = false;
  nomeResponsavelEndereco = '';
  enderecoConfirmacao: EnderecoForm | null = null;

  // Endereços do paciente copiados de responsáveis (um por cópia). Servem para perguntar, ao remover o
  // responsável, se os endereços que vieram dele saem junto. `chave` = item da lista.
  origensEnderecoPaciente: OrigemEndereco[] = [];

  // Remoção pendente enquanto a pergunta está aberta, com os endereços que podem sair junto.
  remocaoPendente: number | null = null;
  enderecosDaRemocao: OrigemEndereco[] = [];

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

    // Quem passa a residir com o paciente e já tem endereço cadastrado fora da lista dele: o usuário
    // escolhe o que fazer (lista vazia: usar o endereço dele; senão: adicionar, morar no do paciente ou
    // não residir). Quem já residia (resideAntes) acompanha o paciente e não entra aqui.
    const endereco = this.enderecoQueOPacienteRecebe(item);
    const lista = this.enderecosPaciente;
    if (endereco && lista && !lista.itens.some((i) => mesmoEnderecoForm(i, endereco))) {
      this.nomeResponsavelEndereco = item.nome.trim();
      this.enderecoConfirmacao = endereco;
      if (lista.itens.length) this.enderecoDiferenteAberto = true;
      else this.confirmarEnderecoAberto = true;
      return;
    }

    this.confirmarItem(item);
  }

  // Lista vazia: "Usar no paciente" (é a opção "Adicionar como endereço do paciente").
  confirmarTrocaEndereco() {
    this.confirmarEnderecoAberto = false;
    this.adicionarEnderecoDoResponsavel();
  }

  cancelarTrocaEndereco() {
    this.confirmarEnderecoAberto = false;
  }

  // Opção 1: o endereço dele entra na lista do paciente e ele mora nele (pais separados).
  adicionarComoEnderecoDoPaciente() {
    this.enderecoDiferenteAberto = false;
    this.adicionarEnderecoDoResponsavel();
  }

  // Opção 2: ele se mudou para a casa do paciente; a API substitui o endereço antigo dele (D11).
  morarNoEnderecoDoPaciente() {
    this.enderecoDiferenteAberto = false;
    this.confirmarItem({ ...this.novoResponsavel, endereco: null, residencia: [] });
  }

  // Opção 3: fica com o endereço dele. O card continua aberto para o usuário revisar e confirmar.
  marcarQueNaoReside() {
    this.enderecoDiferenteAberto = false;
    this.novoResponsavel.naoResideComPaciente = true;
    this.aoMudarResidencia();
  }

  fecharEnderecoDiferente() {
    this.enderecoDiferenteAberto = false;
  }

  private adicionarEnderecoDoResponsavel() {
    const item: ResponsavelItem = { ...this.novoResponsavel, endereco: null };
    const adicionado = this.enderecosPaciente?.adicionar({ ...item.enderecoCadastro! });
    if (adicionado) {
      item.residencia = [adicionado.chave];
      this.origensEnderecoPaciente = [...this.origensEnderecoPaciente, this.origemDe(item, adicionado.chave)];
    }
    this.confirmarItem(item);
  }

  private origemDe(r: ResponsavelItem, chave: string): OrigemEndereco {
    return { cpf: soDigitos(r.cpf), nome: r.nome.trim(), endereco: { ...r.enderecoCadastro! }, chave };
  }

  // Endereços copiados deste responsável (a busca é pelo CPF: o item é recriado a cada edição).
  origensDe(r: ResponsavelItem): OrigemEndereco[] {
    return this.origensEnderecoPaciente.filter((o) => o.cpf === soDigitos(r.cpf));
  }

  private confirmarItem(item: ResponsavelItem) {
    // A origem passou a "não reside": os endereços ficam com o paciente, sem perguntar ao remover.
    if (item.naoResideComPaciente) {
      const cpf = soDigitos(item.cpf);
      this.origensEnderecoPaciente = this.origensEnderecoPaciente.filter((o) => o.cpf !== cpf);
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
    const perguntar: OrigemEndereco[] = [];
    const manter = this.origensEnderecoPaciente.filter((o) => o.cpf !== soDigitos(r.cpf));

    for (const origem of this.origensDe(r)) {
      // O endereço saiu da lista ou foi alterado à mão depois da cópia: passou a ser do paciente.
      const copiado = this.enderecosPaciente?.itens.find((i) => i.chave === origem.chave);
      if (!copiado || !mesmoEnderecoForm(copiado, origem.endereco)) continue;

      // Outro responsável mora nele: o endereço continua valendo. Se o endereço também é o dele, ele
      // passa a ser a origem (removê-lo depois faz a pergunta).
      const outros = this.listaResponsaveis.filter(
        (x, i) => i !== index && !x.naoResideComPaciente && x.residencia.includes(origem.chave)
      );
      if (outros.length) {
        const dono = outros.find((x) => !!x.enderecoCadastro && mesmoEnderecoForm(x.enderecoCadastro, copiado));
        if (dono) manter.push(this.origemDe(dono, origem.chave));
        continue;
      }
      perguntar.push(origem);
    }

    this.origensEnderecoPaciente = manter;
    if (!perguntar.length) {
      this.removerDaLista(index);
      return;
    }
    this.enderecosDaRemocao = perguntar;
    this.remocaoPendente = index; // o diálogo decide
  }

  // "Rua A, 10 - Centro, Sorocaba/SP; Rua B, …" dos endereços da pergunta de remoção.
  get textoEnderecosDaRemocao(): string {
    return this.enderecosDaRemocao.map((o) => enderecoEmTexto(o.endereco)).join('; ');
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
    const enderecos = this.enderecosDaRemocao;
    this.enderecosDaRemocao = [];
    if (index === null) return;
    if (limparEndereco) for (const o of enderecos) this.enderecosPaciente?.remover(o.chave);
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
    this.origensEnderecoPaciente = [];
    this.remocaoPendente = null;
    this.enderecosDaRemocao = [];
    this.listaResponsaveis = [];
    this.cancelarEdicao();
    this.erros = {};
  }
}
