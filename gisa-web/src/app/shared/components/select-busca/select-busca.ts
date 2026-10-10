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

export interface OpcaoSelectBusca {
  id: number | string;
  label: string;
  // Texto mostrado no campo depois de escolher (se omitido, usa o label).
  rotuloSelecionado?: string;
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

  ngOnChanges(changes: SimpleChanges) {
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
    const alvo = this.normalizar(this.termo().trim());
    if (!alvo) return this.opcoes;
    return this.opcoes.filter((o) => this.normalizar(o.label).includes(alvo));
  }

  get opcoesFiltradas(): OpcaoSelectBusca[] {
    return this.todasFiltradas.slice(0, this.limite);
  }

  get restantes(): number {
    return Math.max(0, this.todasFiltradas.length - this.limite);
  }

  aoFocar() {
    if (this.disabled) return;
    this.aberto.set(true);
  }

  aoDigitar(texto: string) {
    this.termo.set(texto);
    this.aberto.set(true);
    // Enquanto o usuário digita e o texto não bate mais com a opção escolhida, limpamos a seleção.
    const selecionada = this.opcoes.find((o) => o.id === this.value);
    if (!selecionada || this.rotulo(selecionada) !== texto) {
      this.valueChange.emit(null);
    }
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