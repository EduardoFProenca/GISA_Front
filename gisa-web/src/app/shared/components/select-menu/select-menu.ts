import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface MenuOption {
  value: string;
  label: string;
  disabled: boolean;
}

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.html',
  styleUrl: './select-menu.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectMenu),
      multi: true,
    },
  ],
})
export class SelectMenu implements ControlValueAccessor, OnDestroy {
  private static nextId = 0;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly generatedId = `app-select-menu-${SelectMenu.nextId++}`;

  @Input() id = '';
  @Input() placeholder = 'Selecione';
  @Input() disabled = false;
  @Input('aria-label') ariaLabel = '';
  @Output() change = new EventEmitter<void>();

  @ViewChild('optionSource') private optionSource?: ElementRef<HTMLSelectElement>;
  @ViewChild('trigger') private trigger?: ElementRef<HTMLButtonElement>;

  readonly value = signal<string | null>(null);
  readonly aberto = signal(false);
  readonly indiceAtivo = signal(-1);
  readonly abrirAcima = signal(false);
  readonly alturaMaxima = signal(240);
  private desabilitadoPeloFormulario = false;
  private termoDigitado = '';
  private temporizadorTermo?: ReturnType<typeof setTimeout>;

  private aoMudarValor: (value: string) => void = () => {};
  private aoTocar: () => void = () => {};

  constructor() {
    this.element.nativeElement.removeAttribute('id');
  }

  get controlId(): string {
    return this.id || this.generatedId;
  }

  get listboxId(): string {
    return `${this.controlId}-listbox`;
  }

  get isDisabled(): boolean {
    return this.disabled || this.desabilitadoPeloFormulario;
  }

  get opcoes(): MenuOption[] {
    const select = this.optionSource?.nativeElement;
    if (!select) return [];

    return Array.from(select.options).map((opcao) => ({
      value: opcao.value,
      label: opcao.textContent?.trim() ?? '',
      disabled: opcao.disabled,
    }));
  }

  get opcaoSelecionada(): MenuOption | undefined {
    const opcoes = this.opcoes;
    return opcoes.find((opcao) => opcao.value === this.value())
      ?? opcoes.find((_, indice) => this.optionSource?.nativeElement.options[indice]?.selected)
      ?? opcoes[0];
  }

  get textoSelecionado(): string {
    return this.opcaoSelecionada?.label || this.placeholder;
  }

  writeValue(value: unknown): void {
    this.value.set(value === null || value === undefined ? null : String(value));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.aoMudarValor = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.desabilitadoPeloFormulario = isDisabled;
  }

  alternar(): void {
    if (this.isDisabled) return;
    if (this.aberto()) {
      this.fechar();
    } else {
      this.abrir();
    }
  }

  abrir(): void {
    if (this.isDisabled) return;
    const opcoes = this.opcoes;
    const selecionado = opcoes.findIndex((opcao) => opcao.value === this.value() && !opcao.disabled);
    this.indiceAtivo.set(selecionado >= 0 ? selecionado : opcoes.findIndex((opcao) => !opcao.disabled));
    this.posicionarLista();
    this.aberto.set(true);
  }

  fechar(): void {
    if (!this.aberto()) return;
    this.aberto.set(false);
    this.aoTocar();
  }

  selecionar(opcao: MenuOption): void {
    if (this.isDisabled || opcao.disabled) return;
    this.value.set(opcao.value);
    this.aoMudarValor(opcao.value);
    this.aoTocar();
    this.aberto.set(false);
    this.change.emit();
  }

  idOpcao(indice: number): string {
    return `${this.listboxId}-opcao-${indice}`;
  }

  aoPassarMouseNaOpcao(indice: number, desabilitada: boolean): void {
    if (!desabilitada) this.indiceAtivo.set(indice);
  }

  aoPressionarTecla(evento: KeyboardEvent): void {
    if (this.isDisabled) return;

    switch (evento.key) {
      case 'ArrowDown':
        evento.preventDefault();
        if (!this.aberto()) this.abrir();
        else this.moverAtivo(1);
        return;
      case 'ArrowUp':
        evento.preventDefault();
        if (!this.aberto()) this.abrir();
        else this.moverAtivo(-1);
        return;
      case 'Home':
        if (this.aberto()) {
          evento.preventDefault();
          this.indiceAtivo.set(this.primeiroIndiceHabilitado());
        }
        return;
      case 'End':
        if (this.aberto()) {
          evento.preventDefault();
          this.indiceAtivo.set(this.ultimoIndiceHabilitado());
        }
        return;
      case 'Enter':
      case ' ':
        evento.preventDefault();
        if (this.aberto()) this.selecionarIndiceAtivo();
        else this.abrir();
        return;
      case 'Escape':
        if (this.aberto()) {
          evento.preventDefault();
          this.fechar();
        }
        return;
      case 'Tab':
        this.fechar();
        return;
      default:
        this.buscarPorTecla(evento);
    }
  }

  aoClicarFora(evento: MouseEvent): void {
    if (!this.element.nativeElement.contains(evento.target as Node)) this.fechar();
  }

  ngOnDestroy(): void {
    if (this.temporizadorTermo) clearTimeout(this.temporizadorTermo);
  }

  @HostListener('document:click', ['$event'])
  private aoClicarNoDocumento(evento: MouseEvent): void {
    this.aoClicarFora(evento);
  }

  private posicionarLista(): void {
    if (typeof window === 'undefined' || !this.trigger) return;
    const retangulo = this.trigger.nativeElement.getBoundingClientRect();
    const abaixo = window.innerHeight - retangulo.bottom - 12;
    const acima = retangulo.top - 12;
    const paraCima = abaixo < 240 && acima > abaixo;
    this.abrirAcima.set(paraCima);
    this.alturaMaxima.set(Math.max(120, Math.min(240, paraCima ? acima : abaixo)));
  }

  private moverAtivo(direcao: 1 | -1): void {
    const habilitados = this.opcoes
      .map((opcao, indice) => ({ opcao, indice }))
      .filter(({ opcao }) => !opcao.disabled)
      .map(({ indice }) => indice);
    if (!habilitados.length) return;

    const atual = habilitados.indexOf(this.indiceAtivo());
    const proximo = atual < 0
      ? (direcao > 0 ? 0 : habilitados.length - 1)
      : (atual + direcao + habilitados.length) % habilitados.length;
    this.indiceAtivo.set(habilitados[proximo]);
  }

  private primeiroIndiceHabilitado(): number {
    return this.opcoes.findIndex((opcao) => !opcao.disabled);
  }

  private ultimoIndiceHabilitado(): number {
    const opcoes = this.opcoes;
    for (let indice = opcoes.length - 1; indice >= 0; indice--) {
      if (!opcoes[indice].disabled) return indice;
    }
    return -1;
  }

  private selecionarIndiceAtivo(): void {
    const opcao = this.opcoes[this.indiceAtivo()];
    if (opcao) this.selecionar(opcao);
  }

  private buscarPorTecla(evento: KeyboardEvent): void {
    if (evento.key.length !== 1 || evento.ctrlKey || evento.altKey || evento.metaKey) return;

    const opcoes = this.opcoes;
    if (!opcoes.length) return;

    this.termoDigitado += evento.key.toLocaleLowerCase();
    if (this.temporizadorTermo) clearTimeout(this.temporizadorTermo);
    this.temporizadorTermo = setTimeout(() => (this.termoDigitado = ''), 600);

    const selecionado = this.aberto()
      ? this.indiceAtivo()
      : opcoes.findIndex((opcao) => opcao.value === this.value());
    const inicio = Math.max(selecionado, -1);
    for (let deslocamento = 1; deslocamento <= opcoes.length; deslocamento++) {
      const indice = (inicio + deslocamento) % opcoes.length;
      if (!opcoes[indice].disabled && opcoes[indice].label.toLocaleLowerCase().startsWith(this.termoDigitado)) {
        if (!this.aberto()) this.abrir();
        this.indiceAtivo.set(indice);
        break;
      }
    }
  }
}
