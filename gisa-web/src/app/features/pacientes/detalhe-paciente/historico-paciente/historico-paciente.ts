import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { EventoPaciente } from '../../../../core/models/historico.model';
import { PacienteService } from '../../../../core/services/paciente';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { Paginacao } from '../../../../shared/components/paginacao/paginacao';
import { dataHoraLocal } from '../../../../shared/utils/data.util';
import { ROTULO_EVENTO_PACIENTE } from '../../../../shared/utils/rotulos.util';

// Linha do tempo do paciente (GET /pacientes/{id}/historico), mais recentes primeiro.
@Component({
  selector: 'app-historico-paciente',
  imports: [Paginacao],
  templateUrl: './historico-paciente.html',
  styleUrl: './historico-paciente.scss',
})
export class HistoricoPaciente {
  private pacienteService = inject(PacienteService);

  idPaciente = input.required<number>();

  readonly itensPorPagina = 10;
  readonly rotulos = ROTULO_EVENTO_PACIENTE;
  readonly dataHora = dataHoraLocal;

  eventos = signal<EventoPaciente[]>([]);
  total = signal(0);
  pagina = signal(1);
  carregando = signal(false);
  erro = signal('');

  constructor() {
    // Recarrega só quando o paciente muda (untracked: a paginação não dispara o effect).
    effect(() => {
      this.idPaciente();
      untracked(() => this.recarregar());
    });
  }

  // Chamado pelo detalhe depois de inativar/reativar, para o evento novo aparecer.
  recarregar() {
    this.pagina.set(1);
    this.carregar();
  }

  mudarPagina(p: number) {
    this.pagina.set(p);
    this.carregar();
  }

  private carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.pacienteService
      .historico(this.idPaciente(), { page: this.pagina() - 1, size: this.itensPorPagina })
      .subscribe({
        next: (p) => {
          this.eventos.set(p.content);
          this.total.set(p.totalElements);
          this.carregando.set(false);
        },
        error: (err) => {
          this.erro.set(mensagemDeErro(err, 'Não foi possível carregar o histórico.'));
          this.carregando.set(false);
        },
      });
  }
}
