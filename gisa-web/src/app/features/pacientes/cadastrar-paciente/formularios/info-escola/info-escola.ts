import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map, tap } from 'rxjs';
import { Mascara } from '../../../../../shared/directives/mascara.directive';
import { ComErros } from '../../../../../shared/components/com-erros';
import { BuscaSelect, OpcaoSelectBusca, SelectBusca } from '../../../../../shared/components/select-busca/select-busca';
import { TipoEscola } from '../../../../../core/models/escola.model';
import { Escola } from '../../../../../core/models/escola.model';
import { EscolaService } from '../../../../../core/services/escola';
import { formatarCelular } from '../../../../../shared/utils/formatacao.util';
import { ROTULO_TIPO_ESCOLA } from '../../../../../shared/utils/rotulos.util';

const normalizar = (nome: string) => nome.trim().toLowerCase();

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, Mascara, SelectBusca],
  selector: 'app-info-escola',
  styleUrl: './info-escola.scss',
  templateUrl: './info-escola.html',
})
export class InfoEscola extends ComErros {
  private escolaService = inject(EscolaService);

  nome = '';
  tipoEscola: TipoEscola | '' = '';
  telefone = '';

  // Escola já cadastrada escolhida na lista. Se null e houver nome, a escola é nova
  // e será cadastrada (POST /escolas) antes do paciente.
  escolaSelecionada: Escola | null = null;

  // Escolas das últimas buscas, pelo id (para preencher tipo e telefone ao escolher).
  private encontradas = new Map<number, Escola>();

  // Busca na API conforme a digitação (até 10 escolas; sem texto, as 10 primeiras).
  readonly buscarEscolas: BuscaSelect = (termo) =>
    this.escolaService.buscarPorNome(termo).pipe(
      tap((lista) => {
        for (const e of lista) this.encontradas.set(e.idEscola, e);
        this.selecionarSeNomeExato(lista);
      }),
      map((lista) => lista.map((e) => this.opcao(e)))
    );

  // Edição: o paciente já tem escola cadastrada.
  @Input() set escolaInicial(e: Escola | null | undefined) {
    if (!e) return;
    this.encontradas.set(e.idEscola, e);
    this.aplicar(e);
  }

  opcoesTipoEscola: { label: string; value: TipoEscola }[] = [
    { label: 'Pública', value: 'PUBLICA' },
    { label: 'Particular', value: 'PARTICULAR' },
  ];

  // Escola já escolhida, para o campo mostrar quem é (só muda junto com a escolha).
  opcoesConhecidas: OpcaoSelectBusca[] = [];

  get escolaNova(): boolean {
    return !this.escolaSelecionada && this.nome.trim().length > 0;
  }

  private opcao(e: Escola): OpcaoSelectBusca {
    return { id: e.idEscola, label: `${e.nome} · ${ROTULO_TIPO_ESCOLA[e.tipoEscola]}`, rotuloSelecionado: e.nome };
  }

  aoDigitarNome(texto: string) {
    this.nome = texto;
    this.limparErro('nome');
    this.limparErro('escola');
  }

  aoEscolher(id: number | string | null) {
    const escola = id === null ? undefined : this.encontradas.get(Number(id));
    if (escola) this.aplicar(escola);
    else if (this.escolaSelecionada) this.desfazerSelecao();
  }

  // Nome digitado igual ao de uma escola encontrada: é ela (evita cadastrar a mesma escola de novo).
  private selecionarSeNomeExato(lista: Escola[]) {
    if (this.escolaSelecionada) return;
    const alvo = normalizar(this.nome);
    const achada = alvo ? lista.find((e) => normalizar(e.nome) === alvo) : undefined;
    if (achada) this.aplicar(achada);
  }

  private aplicar(e: Escola) {
    this.escolaSelecionada = e;
    this.opcoesConhecidas = [this.opcao(e)];
    this.nome = e.nome;
    this.tipoEscola = e.tipoEscola;
    this.telefone = formatarCelular(e.telefone ?? '');
    this.limparErro('tipoEscola');
  }

  private desfazerSelecao() {
    this.escolaSelecionada = null;
    this.tipoEscola = '';
    this.telefone = '';
  }

  limpar() {
    this.nome = '';
    this.desfazerSelecao();
    this.erros = {};
  }
}
