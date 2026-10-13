import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Terapia } from '../../../../core/models/terapia.model';
import { TerapiaService } from '../../../../core/services/terapia';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { Paginacao } from '../../../../shared/components/paginacao/paginacao';
import { dataCurta } from '../../../../shared/utils/data.util';
import { ROTULO_PRESENCA, ROTULO_STATUS_TERAPIA } from '../../../../shared/utils/rotulos.util';
import { horarioTerapia } from '../../../terapias/registrar-presenca/presenca.util';

// Terapias do paciente (GET /terapias?idPaciente=), mais recentes primeiro.
@Component({
  selector: 'app-terapias-paciente',
  imports: [Paginacao, RouterLink],
  templateUrl: './terapias-paciente.html',
  styleUrl: './terapias-paciente.scss',
})
export class TerapiasPaciente {
  private terapiaService = inject(TerapiaService);

  idPaciente = input.required<number>();
  // Base das rotas de terapia do painel; vazio = lista sem link (ex.: Assistente Social).
  rotaTerapias = input('');

  readonly itensPorPagina = 5;
  readonly status = ROTULO_STATUS_TERAPIA;
  readonly presencaRotulo = ROTULO_PRESENCA;
  readonly data = dataCurta;
  readonly horario = horarioTerapia;

  terapias = signal<Terapia[]>([]);
  total = signal(0);
  pagina = signal(1);
  carregando = signal(false);
  erro = signal('');

  constructor() {
    effect(() => {
      this.idPaciente();
      untracked(() => {
        this.pagina.set(1);
        this.carregar();
      });
    });
  }

  presencaDoPaciente(t: Terapia): string {
    const p = t.pacientes.find((x) => x.idCadastro === this.idPaciente());
    return p ? this.presencaRotulo[p.presenca] : '';
  }

  especialistas(t: Terapia): string {
    return t.especialistas.map((e) => e.nome).join(', ');
  }

  mudarPagina(p: number) {
    this.pagina.set(p);
    this.carregar();
  }

  private carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.terapiaService
      .listar({
        idPaciente: this.idPaciente(),
        page: this.pagina() - 1,
        size: this.itensPorPagina,
        sort: 'dataHoraInicio,desc',
      })
      .subscribe({
        next: (p) => {
          this.terapias.set(p.content);
          this.total.set(p.totalElements);
          this.carregando.set(false);
        },
        error: (err) => {
          this.erro.set(mensagemDeErro(err, 'Não foi possível carregar as terapias.'));
          this.carregando.set(false);
        },
      });
  }
}
