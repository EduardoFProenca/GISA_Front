import { Component, Input, computed, signal } from '@angular/core';
import { Cid } from '../../../../../core/models/cid.model';
import { EventoPaciente, TipoEventoPaciente } from '../../../../../core/models/historico.model';
import { dataHoraLocal } from '../../../../../shared/utils/data.util';
import { ROTULO_EVENTO_PACIENTE, tomEventoPaciente } from '../../../../../shared/utils/rotulos.util';

type Filtro = 'TODOS' | 'TERAPIAS' | 'CADASTRO';

const TIPOS_TERAPIA: TipoEventoPaciente[] = ['TERAPIA_AGENDADA', 'TERAPIA_ALTERADA', 'TERAPIA_CANCELADA', 'PRESENCA_REGISTRADA'];

// Aba 1 - Histórico Unificado (RF09): diagnósticos (CIDs do paciente) e linha do tempo de eventos
// (GET /pacientes/{id}/historico).
@Component({
  selector: 'app-aba-historico',
  imports: [],
  templateUrl: './aba-historico.html',
  styleUrl: './aba-historico.scss',
})
export class AbaHistorico {
  // Em signal para o `computed` reagir quando o pai atualiza a lista.
  private _eventos = signal<EventoPaciente[]>([]);
  @Input() set eventos(lista: EventoPaciente[]) {
    this._eventos.set(lista ?? []);
  }
  @Input() cids: Cid[] = [];
  @Input() carregando = false;
  @Input() erro = '';

  readonly rotulos = ROTULO_EVENTO_PACIENTE;
  readonly tom = tomEventoPaciente;
  readonly dataHora = dataHoraLocal;
  readonly filtros: { valor: Filtro; label: string }[] = [
    { valor: 'TODOS', label: 'Todos' },
    { valor: 'TERAPIAS', label: 'Terapias e presenças' },
    { valor: 'CADASTRO', label: 'Cadastro' },
  ];

  filtro = signal<Filtro>('TODOS');

  visiveis = computed(() => {
    const f = this.filtro();
    const lista = this._eventos().filter(
      (e) => f === 'TODOS' || (f === 'TERAPIAS') === TIPOS_TERAPIA.includes(e.tipo)
    );
    return [...lista].sort((a, b) => b.dataHora.localeCompare(a.dataHora)); // mais recente primeiro
  });
}
