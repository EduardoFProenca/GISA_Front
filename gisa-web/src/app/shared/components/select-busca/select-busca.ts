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
    this.termo.set(selecionada ? selecionada.label : '');
  }

  get opcoesFiltradas(): OpcaoSelectBusca[] {
    const alvo = this.termo().trim().toLowerCase();
    if (!alvo) return this.opcoes;
    return this.opcoes.filter((o) => o.label.toLowerCase().includes(alvo));
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
    if (!selecionada || selecionada.label !== texto) {
      this.valueChange.emit(null);
    }
  }

  selecionar(opcao: OpcaoSelectBusca) {
    this.termo.set(opcao.label);
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