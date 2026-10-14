import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { ICONES } from '../../icons';

export interface OpcaoFiltroAvancado {
  valor: string;
  label: string;
  // Cor do indicador do pill (ex: '#2563eb'). Opcional — sem isso o pill fica neutro.
  cor?: string;
}

export interface EstadoFiltroAvancado {
  status: Set<string>;
  periodo: string;
  dataInicio: string;
  dataFim: string;
}

// Painel de filtros reutilizável: status (multi-seleção) + período (atalhos + intervalo manual).
// Uso: <app-filtro-avancado [statusDisponiveis]="..." [periodosDisponiveis]="..." (filtroAlterado)="..." />
@Component({
  selector: 'app-filtro-avancado',
  imports: [NgIcon, FormsModule],
  templateUrl: './filtro-avancado.html',
  styleUrl: './filtro-avancado.scss',
})
export class FiltroAvancado implements OnChanges {

  @Input() statusDisponiveis: OpcaoFiltroAvancado[] = [];
  @Input() periodosDisponiveis: OpcaoFiltroAvancado[] = [];
  @Input() valorPeriodoManual: string = 'manual';
  @Input() tituloStatus: string = 'Status';
  @Input() tituloPeriodo: string = 'Período';

  @Output() filtroAlterado = new EventEmitter<EstadoFiltroAvancado>();

  icones = ICONES;

  statusSelecionados = signal<Set<string>>(new Set());
  periodoSelecionado = signal<string>('');
  dataInicio = signal('');
  dataFim = signal('');

  ngOnChanges(changes: SimpleChanges) {
    // Se o componente pai recarregar as opções, mantemos a seleção atual — nada a sincronizar aqui.
  }

  get totalFiltrosAtivos(): number {
    const temPeriodo = this.periodoSelecionado() && this.periodoSelecionado() !== this.valorPeriodoManual
      ? 1
      : (this.dataInicio() && this.dataFim() ? 1 : 0);
    return this.statusSelecionados().size + temPeriodo;
  }

  statusEstaAtivo(valor: string): boolean {
    return this.statusSelecionados().has(valor);
  }

  alternarStatus(valor: string) {
    const atual = new Set(this.statusSelecionados());
    if (atual.has(valor)) atual.delete(valor);
    else atual.add(valor);
    this.statusSelecionados.set(atual);
    this.emitir();
  }

  selecionarPeriodo(valor: string) {
    const mesmo = this.periodoSelecionado() === valor;
    this.periodoSelecionado.set(mesmo ? '' : valor);
    if (valor !== this.valorPeriodoManual || mesmo) {
      this.dataInicio.set('');
      this.dataFim.set('');
    }
    this.emitir();
  }

  atualizarDataInicio(valor: string) {
    this.dataInicio.set(valor);
    this.emitir();
  }

  atualizarDataFim(valor: string) {
    this.dataFim.set(valor);
    this.emitir();
  }

  limparFiltros() {
    this.statusSelecionados.set(new Set());
    this.periodoSelecionado.set('');
    this.dataInicio.set('');
    this.dataFim.set('');
    this.emitir();
  }

  private emitir() {
    this.filtroAlterado.emit({
      status: this.statusSelecionados(),
      periodo: this.periodoSelecionado(),
      dataInicio: this.dataInicio(),
      dataFim: this.dataFim(),
    });
  }
}