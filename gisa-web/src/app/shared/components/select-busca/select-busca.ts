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
import { FormsModule } from '@angular/forms';

const ALTURA_LISTA_PX = 220;
const ALTURA_MINIMA_PX = 120;
// Folga entre a lista e a borda da janela.
const MARGEM_TELA_PX = 12;

export interface OpcaoSelectBusca {
  id: number | string;
  label: string;
  // Texto mostrado no campo depois de escolher (se omitido, usa o label).
  rotuloSelecionado?: string;
  // Texto extra que também é pesquisado, sem aparecer (ex.: código do CID sem ponto).
  termosBusca?: string;
}

// Combobox com filtro por texto: digita para reduzir a lista, ou clica pra abrir tudo.
// Uso: <app-select-busca [opcoes]="pacientes" [value]="idPaciente" (valueChange)="idPaciente = $event" placeholder="Selecione o paciente" />
@Component({
  selector: 'app-select-busca',
  imports: [FormsModule],
  templateUrl: './select-busca.html',
  styleUrl: './select-busca.scss',
})
export class SelectBusca implements OnChanges {
  private elementRef = inject(ElementRef);

  @Input() opcoes: OpcaoSelectBusca[] = [];
  @Input() value: number | string | null = null;
  @Input() placeholder: string = 'Selecione';
  @Input() semResultados: string = 'Nenhum resultado encontrado';
  @Input() comErro: boolean = false;
  @Input() disabled: boolean = false;
  // Máximo de opções exibidas de uma vez (listas grandes, como CID). Padrão: todas.
  @Input() limite: number = Infinity;

  @Output() valueChange = new EventEmitter<number | string | null>();

  termo = signal('');
  aberto = signal(false);
  // Perto do fim da tela a lista abre para cima, e a altura se ajusta ao espaço livre.
  abrirAcima = signal(false);
  alturaMaxima = signal(ALTURA_LISTA_PX);

  // Texto de busca de cada opção já normalizado: calculado uma vez por lista de opções, e não a cada
  // tecla (listas grandes, como os ~14 mil CIDs, travariam a digitação).
  private indice: string[] = [];
  // Último filtro calculado: o template consulta o resultado várias vezes por ciclo.
  private cache: { termo: string; opcoes: OpcaoSelectBusca[]; resultado: OpcaoSelectBusca[] } | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['opcoes']) {
      this.indice = this.opcoes.map((o) => this.normalizar(`${o.label} ${o.termosBusca ?? ''}`));
      this.cache = null;
    }
    if (changes['value'] || changes['opcoes']) {
      this.sincronizarTermoComValor();
    }
  }

  private sincronizarTermoComValor() {
    const selecionada = this.opcoes.find((o) => o.id === this.value);
    this.termo.set(selecionada ? this.rotulo(selecionada) : '');
  }

  private rotulo(opcao: OpcaoSelectBusca): string {
    return opcao.rotuloSelecionado ?? opcao.label;
  }

  // Ignora maiúsculas e acentos ("mae" encontra "Mãe").
  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  private get todasFiltradas(): OpcaoSelectBusca[] {
    const termo = this.termo();
    if (this.cache && this.cache.termo === termo && this.cache.opcoes === this.opcoes) return this.cache.resultado;

    const alvo = this.normalizar(termo.trim());
    const resultado = alvo ? this.opcoes.filter((_, i) => this.indice[i].includes(alvo)) : this.opcoes;
    this.cache = { termo, opcoes: this.opcoes, resultado };
    return resultado;
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
    this.abrir();
    // Enquanto o usuário digita e o texto não bate mais com a opção escolhida, limpamos a seleção.
    const selecionada = this.opcoes.find((o) => o.id === this.value);
    if (!selecionada || this.rotulo(selecionada) !== texto) {
      this.valueChange.emit(null);
    }
  }

  private abrir() {
    if (!this.aberto()) this.posicionarLista();
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
    this.termo.set(this.rotulo(opcao));
    this.aberto.set(false);
    this.valueChange.emit(opcao.id);
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(evento: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(evento.target)) {
      this.aberto.set(false);
      this.sincronizarTermoComValor();
    }
  }
}