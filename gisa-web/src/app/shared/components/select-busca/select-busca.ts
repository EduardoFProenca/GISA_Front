import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { ICONES } from '../../icons';
import { Observable, Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';

const ALTURA_LISTA_PX = 220;
const ALTURA_MINIMA_PX = 120;
// Folga entre a lista e a borda da janela.
const MARGEM_TELA_PX = 12;
// Espera entre as teclas antes de consultar a API (modo remoto).
const ESPERA_BUSCA_MS = 300;

export interface OpcaoSelectBusca {
  id: number | string;
  label: string;
  // Texto mostrado no campo depois de escolher (se omitido, usa o label).
  rotuloSelecionado?: string;
  // Texto extra que também é pesquisado, sem aparecer (ex.: código do CID sem ponto).
  termosBusca?: string;
}

// Função de busca do modo remoto: recebe o texto digitado ('' ao abrir) e devolve as opções da API.
export type BuscaSelect = (termo: string) => Observable<OpcaoSelectBusca[]>;

// Combobox com filtro por texto. Dois modos:
// - local:  [opcoes] tem a lista inteira e o filtro é feito aqui (listas fixas: CID, UFs...).
//   <app-select-busca [opcoes]="lista" [value]="id" (valueChange)="id = $event" />
// - remoto: [buscar] consulta a API a cada digitação (listas grandes: pacientes, especialistas).
//   [opcoes], se informado, só serve para mostrar o nome de um valor já escolhido (ex.: na edição).
//   <app-select-busca [buscar]="buscarPacientes" [value]="id" (valueChange)="id = $event" />
@Component({
  selector: 'app-select-busca',
  imports: [FormsModule, NgIcon],
  templateUrl: './select-busca.html',
  styleUrl: './select-busca.scss',
})
export class SelectBusca implements OnChanges {
  private elementRef = inject(ElementRef);
  icones = ICONES;

  @Input() opcoes: OpcaoSelectBusca[] = [];
  @Input() buscar: BuscaSelect | null = null;
  // Ids que não devem aparecer na lista (ex.: pessoas já escolhidas em outro campo).
  @Input() ocultarIds: readonly (number | string)[] = [];
  @Input() value: number | string | null = null;
  @Input() placeholder: string = 'Selecione';
  @Input() semResultados: string = 'Nenhum resultado encontrado';
  // Modo remoto: dica no lugar de "sem resultados" enquanto o termo não basta para buscar
  // (ex.: pacientes só por CPF completo ou nome com 3 letras). null = o termo já basta.
  @Input() dicaTermo: ((termo: string) => string | null) | null = null;
  @Input() comErro: boolean = false;
  @Input() disabled: boolean = false;
  // Máximo de opções exibidas de uma vez (listas grandes, como CID). Padrão: todas.
  @Input() limite: number = Infinity;
  // Texto livre: o que foi digitado vale mesmo sem escolher um item (ex.: escola nova).
  // O texto não é apagado ao sair do campo e chega por (textoChange). [texto] é o valor inicial.
  @Input() textoLivre: boolean = false;
  @Input() texto: string = '';
  // Mostra um "x" no campo para apagar o texto e a seleção de uma vez.
  @Input() limpavel: boolean = false;

  @Output() valueChange = new EventEmitter<number | string | null>();
  @Output() textoChange = new EventEmitter<string>();
  // A opção inteira escolhida (com o rótulo), antes do valueChange.
  @Output() opcaoEscolhida = new EventEmitter<OpcaoSelectBusca>();

  termo = signal('');
  aberto = signal(false);
  // Perto do fim da tela a lista abre para cima, e a altura se ajusta ao espaço livre.
  abrirAcima = signal(false);
  alturaMaxima = signal(ALTURA_LISTA_PX);

  // Modo remoto: resultado da última busca e se há uma em andamento.
  resultadosRemotos = signal<OpcaoSelectBusca[]>([]);
  buscando = signal(false);
  private busca$ = new Subject<string>();
  // true do pedido de busca até chegar a resposta dele (inclui a espera entre as teclas).
  private buscaPendente = false;

  // Nome de cada opção já vista (das [opcoes] e das buscas): mantém o texto do campo
  // mesmo quando o item escolhido não está no resultado da busca atual.
  private conhecidas = new Map<number | string, OpcaoSelectBusca>();

  // Texto de busca de cada opção já normalizado (modo local): calculado uma vez por lista de opções,
  // e não a cada tecla (listas grandes, como os ~14 mil CIDs, travariam a digitação).
  private indice: string[] = [];
  // Último filtro calculado: o template consulta o resultado várias vezes por ciclo.
  private cache: { termo: string; opcoes: OpcaoSelectBusca[]; resultado: OpcaoSelectBusca[] } | null = null;

  constructor() {
    this.busca$
      .pipe(
        debounceTime(ESPERA_BUSCA_MS),
        tap(() => this.buscando.set(true)),
        switchMap((termo) => (this.buscar ? this.buscar(termo.trim()).pipe(catchError(() => of([]))) : of([]))),
        takeUntilDestroyed()
      )
      .subscribe((lista) => {
        for (const o of lista) this.conhecidas.set(o.id, o);
        this.resultadosRemotos.set(lista);
        this.buscando.set(false);
        this.buscaPendente = false;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['opcoes']) {
      for (const o of this.opcoes) this.conhecidas.set(o.id, o);
      this.indice = this.opcoes.map((o) => this.normalizar(`${o.label} ${o.termosBusca ?? ''}`));
      this.cache = null;
    }
    if (changes['value'] || changes['opcoes'] || changes['texto']) {
      this.sincronizarTermoComValor();
    }
  }

  private get remoto(): boolean {
    return !!this.buscar;
  }

  private sincronizarTermoComValor() {
    const selecionada = this.value === null ? undefined : this.conhecidas.get(this.value);
    if (selecionada) this.termo.set(this.rotulo(selecionada));
    else this.termo.set(this.textoLivre ? this.texto : '');
  }

  private rotulo(opcao: OpcaoSelectBusca): string {
    return opcao.rotuloSelecionado ?? opcao.label;
  }

  // Ignora maiúsculas e acentos ("mae" encontra "Mãe").
  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  private get todasFiltradas(): OpcaoSelectBusca[] {
    if (this.remoto) return this.semOcultas(this.resultadosRemotos());

    const termo = this.termo();
    if (this.cache && this.cache.termo === termo && this.cache.opcoes === this.opcoes) {
      return this.semOcultas(this.cache.resultado);
    }
    const alvo = this.normalizar(termo.trim());
    const resultado = alvo ? this.opcoes.filter((_, i) => this.indice[i].includes(alvo)) : this.opcoes;
    this.cache = { termo, opcoes: this.opcoes, resultado };
    return this.semOcultas(resultado);
  }

  private semOcultas(lista: OpcaoSelectBusca[]): OpcaoSelectBusca[] {
    return this.ocultarIds.length ? lista.filter((o) => !this.ocultarIds.includes(o.id)) : lista;
  }

  get opcoesFiltradas(): OpcaoSelectBusca[] {
    return this.todasFiltradas.slice(0, this.limite);
  }

  get restantes(): number {
    return Math.max(0, this.todasFiltradas.length - this.limite);
  }

  aoFocar() {
    if (this.disabled) return;
    this.abrir();
  }

  aoDigitar(texto: string) {
    this.termo.set(texto);
    if (this.textoLivre) {
      this.texto = texto;
      this.textoChange.emit(texto);
    }
    this.abrir(false);
    if (this.remoto) this.pedirBusca(texto);
    // Enquanto o usuário digita e o texto não bate mais com a opção escolhida, limpamos a seleção.
    const selecionada = this.value === null ? undefined : this.conhecidas.get(this.value);
    if (!selecionada || this.rotulo(selecionada) !== texto) {
      this.valueChange.emit(null);
    }
  }

  // Ao abrir no modo remoto, busca a primeira página (sem termo, ou com o texto que já está no campo).
  private abrir(buscarAoAbrir = true) {
    if (!this.aberto()) {
      this.posicionarLista();
      if (this.remoto && buscarAoAbrir) {
        const escolhida = this.value !== null && this.conhecidas.has(this.value);
        this.pedirBusca(escolhida ? '' : this.termo());
      }
    }
    this.aberto.set(true);
  }

  private posicionarLista() {
    if (typeof window === 'undefined') return;
    const campo = this.elementRef.nativeElement.getBoundingClientRect();
    const abaixo = window.innerHeight - campo.bottom - MARGEM_TELA_PX;
    const acima = campo.top - MARGEM_TELA_PX;
    const paraCima = abaixo < ALTURA_LISTA_PX && acima > abaixo;
    this.abrirAcima.set(paraCima);
    this.alturaMaxima.set(Math.max(ALTURA_MINIMA_PX, Math.min(ALTURA_LISTA_PX, paraCima ? acima : abaixo)));
  }

  selecionar(opcao: OpcaoSelectBusca) {
    this.conhecidas.set(opcao.id, opcao);
    this.termo.set(this.rotulo(opcao));
    this.aberto.set(false);
    if (this.textoLivre) {
      this.texto = this.rotulo(opcao);
      this.textoChange.emit(this.texto);
    }
    this.opcaoEscolhida.emit(opcao);
    this.valueChange.emit(opcao.id);
  }

  // ENTER com texto digitado escolhe a opção de rótulo igual ao texto ou, sem ela, a primeira da
  // lista (ex.: "8" na hora escolhe 08). Sem texto ou sem opções, não faz nada.
  aoPressionarEnter(evento: Event) {
    const termo = this.normalizar(this.termo().trim());
    if (!this.aberto() || !termo) return;
    evento.preventDefault();
    // Busca remota ainda sem resposta para o texto atual: a lista seria a da busca anterior.
    if (this.remoto && this.buscaPendente) return;
    const opcoes = this.opcoesFiltradas;
    if (!opcoes.length) return;
    const exata = opcoes.find((o) => this.normalizar(this.rotulo(o)) === termo);
    this.selecionar(exata ?? opcoes[0]);
  }

  private pedirBusca(termo: string) {
    this.buscaPendente = true;
    this.busca$.next(termo);
  }

  limpar() {
    this.termo.set('');
    this.aberto.set(false);
    if (this.textoLivre) {
      this.texto = '';
      this.textoChange.emit('');
    }
    if (this.value !== null) this.valueChange.emit(null);
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(evento: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(evento.target)) {
      this.aberto.set(false);
      this.sincronizarTermoComValor();
    }
  }
}
