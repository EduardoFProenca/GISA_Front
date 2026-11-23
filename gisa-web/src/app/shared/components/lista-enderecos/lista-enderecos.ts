import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Endereco } from '../../../core/models/comum.model';
import { PacienteValidadorService } from '../../../features/pacientes/cadastrar-paciente/services/paciente-validador';
import { ICONES } from '../../icons';
import {
  EnderecoForm,
  EnderecoItem,
  enderecoParaApi,
  enderecoParaForm,
  enderecoVazio,
  mesmoEnderecoForm,
} from '../../utils/endereco.util';
import { Botao } from '../botao/botao';
import { ComErros } from '../com-erros';
import { Contato } from '../contato/contato';

const OBRIGATORIO = 'Campo obrigatório.';

// Lista de endereços de um formulário: cards de resumo + um formulário aberto por vez.
// Não sabe nada de paciente ou responsável; quem precisa de algo por card usa `extraCard`.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-lista-enderecos',
  imports: [Botao, NgIcon, NgTemplateOutlet, Contato],
  templateUrl: './lista-enderecos.html',
  styleUrl: './lista-enderecos.scss',
})
export class ListaEnderecos extends ComErros implements OnInit {
  // Reaproveita a regra de endereço completo do paciente, para não duplicar validação.
  private validador = inject(PacienteValidadorService);
  private contadorNovos = 0;

  @Input() titulo = 'Endereços';
  @Input() subtitulo = '';
  @Input() obrigatorio = false;
  @Input() set enderecosIniciais(lista: Endereco[] | undefined) {
    if (!lista) return;
    this.itens = lista.map((e) => ({
      ...enderecoParaForm(e),
      idEndereco: e.idEndereco,
      chave: e.idEndereco != null ? `id-${e.idEndereco}` : this.chaveNova(),
    }));
    this.abrirSeObrigatorioVazio();
  }
  @Input() extraCard?: TemplateRef<{ $implicit: EnderecoItem; index: number }>;
  @Output() mudou = new EventEmitter<void>();

  @ViewChild(Contato) contato?: Contato;

  readonly icones = ICONES;

  itens: EnderecoItem[] = [];
  exibindoFormulario = false;
  indexEdicao: number | null = null;
  erroCard = '';
  dadosFormulario?: Partial<EnderecoForm>;
  // Muda a cada abertura: o app-contato só lê os dados iniciais no ngOnInit e precisa ser recriado.
  geracaoFormulario = 0;

  ngOnInit() {
    this.abrirSeObrigatorioVazio();
  }

  // Sem o Cancelar quando é o primeiro endereço de uma lista obrigatória (não há para onde voltar).
  get podeCancelar(): boolean {
    return !(this.obrigatorio && this.itens.length === 0 && this.indexEdicao === null);
  }

  private chaveNova(): string {
    return `novo-${++this.contadorNovos}`;
  }

  private abrirSeObrigatorioVazio() {
    if (this.obrigatorio && this.itens.length === 0 && !this.exibindoFormulario) this.abrirFormulario();
  }

  abrirFormulario() {
    this.indexEdicao = null;
    this.dadosFormulario = undefined;
    this.abrir();
  }

  editar(index: number) {
    const { cep, endereco, numero, complemento, bairro, cidade, uf } = this.itens[index];
    this.indexEdicao = index;
    this.dadosFormulario = { cep, endereco, numero, complemento, bairro, cidade, uf };
    this.abrir();
  }

  private abrir() {
    this.erroCard = '';
    this.geracaoFormulario++;
    this.exibindoFormulario = true;
    this.limparErro('enderecos');
  }

  cancelarEdicao() {
    this.fechar();
  }

  private fechar() {
    this.exibindoFormulario = false;
    this.indexEdicao = null;
    this.dadosFormulario = undefined;
    this.erroCard = '';
  }

  confirmar() {
    const contato = this.contato;
    if (!contato) return;
    contato.erros = {};
    this.erroCard = '';

    // validarEnderecoOpcional ignora endereço vazio; aqui o endereço é obrigatório.
    if (enderecoVazio(contato)) {
      for (const campo of ['cep', 'endereco', 'numero', 'bairro', 'cidade', 'uf']) contato.erros[campo] = OBRIGATORIO;
      return;
    }
    let valido = true;
    this.validador.validarEnderecoOpcional(contato, (alvo, campo, mensagem = OBRIGATORIO) => {
      alvo.erros[campo] = mensagem;
      valido = false;
    });
    if (!valido) return;

    const form: EnderecoForm = {
      cep: contato.cep,
      endereco: contato.endereco,
      numero: contato.numero,
      complemento: contato.complemento,
      bairro: contato.bairro,
      cidade: contato.cidade,
      uf: contato.uf,
    };
    // A API recusaria (400) o endereço repetido; avisar aqui é melhor do que no salvar.
    if (this.itens.some((x, i) => i !== this.indexEdicao && mesmoEnderecoForm(x, form))) {
      this.erroCard = 'Este endereço já está na lista.';
      return;
    }

    if (this.indexEdicao !== null) {
      // Editado de novo: a resposta ao 409 era sobre o valor anterior.
      this.itens = this.itens.map((x, i) => (i === this.indexEdicao ? { ...x, ...form, alterarParaTodos: undefined } : x));
    } else {
      this.itens = [...this.itens, { ...form, chave: this.chaveNova() }];
    }
    this.fechar();
    this.mudou.emit();
  }

  // Uso externo (ex.: copiar o endereço de um responsável). Entra no fim da lista.
  adicionar(e: EnderecoForm): EnderecoItem {
    const item: EnderecoItem = { ...e, chave: this.chaveNova() };
    this.itens = [...this.itens, item];
    // Formulário novo e vazio aberto só porque a lista era obrigatória: já não faz sentido.
    if (this.exibindoFormulario && this.indexEdicao === null && (!this.contato || enderecoVazio(this.contato))) {
      this.fechar();
    }
    this.limparErro('enderecos');
    return item;
  }

  remover(chave: string) {
    const index = this.itens.findIndex((x) => x.chave === chave);
    if (index < 0) return;
    this.itens = this.itens.filter((x) => x.chave !== chave);
    if (this.indexEdicao === index) this.fechar();
    else if (this.indexEdicao !== null && index < this.indexEdicao) this.indexEdicao--;
    this.abrirSeObrigatorioVazio();
    this.mudou.emit();
  }

  validar(): boolean {
    this.limparErro('enderecos');
    const vazioAberto = this.exibindoFormulario && !!this.contato && enderecoVazio(this.contato);

    if (this.exibindoFormulario && !vazioAberto) {
      this.erros['enderecos'] = 'Confirme ou cancele o endereço que está sendo preenchido.';
    } else if (this.obrigatorio && this.itens.length === 0) {
      this.erros['enderecos'] = 'Informe ao menos um endereço.';
    }
    return !this.erros['enderecos'];
  }

  // Respostas do diálogo de endereço compartilhado, por idEndereco.
  aplicarDecisoes(decisoes: Map<number, boolean>) {
    this.itens = this.itens.map((x) =>
      x.idEndereco != null && decisoes.has(x.idEndereco) ? { ...x, alterarParaTodos: decisoes.get(x.idEndereco) } : x
    );
  }

  paraApi(): Endereco[] {
    return this.itens.map(enderecoParaApi);
  }
}
