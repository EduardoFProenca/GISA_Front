import { Component, computed, input, output } from '@angular/core';
import { PacienteTerapia, Presenca } from '../../../../../core/models/terapia.model';
import { ROTULO_MODALIDADE, ROTULO_STATUS_TERAPIA } from '../../../../../shared/utils/rotulos.util';
import { LinhaPacientePresenca } from '../linha-paciente-presenca/linha-paciente-presenca';
import { TerapiaDoDia, especialistasTexto, horarioTerapia } from '../../presenca.util';

export interface PresencaMarcada {
  idPaciente: number;
  presenca: Presenca;
  justificativa: string | null;
}

// Card de uma terapia com a lista de pacientes e os botões de presença.
@Component({
  selector: 'app-card-terapia-presenca',
  imports: [LinhaPacientePresenca],
  templateUrl: './card-terapia-presenca.html',
  styleUrl: './card-terapia-presenca.scss',
})
export class CardTerapiaPresenca {
  terapia = input.required<TerapiaDoDia>();
  // idPaciente que está sendo salvo nesta terapia (null = nenhum)
  idPacienteSalvando = input<number | null>(null);
  // false = só mostra a presença, sem os botões (usuário sem permissão).
  podeRegistrar = input(true);

  presencaMarcada = output<PresencaMarcada>();

  horario = computed(() => horarioTerapia(this.terapia()));
  meta = computed(() => `${ROTULO_MODALIDADE[this.terapia().modalidade]} · ${especialistasTexto(this.terapia())}`);
  rotuloStatus = computed(() => ROTULO_STATUS_TERAPIA[this.terapia().status]);
  cancelada = computed(() => this.terapia().status === 'CANCELADA');
  // Todos os pacientes justificaram a falta: o horário do especialista ficou livre (vem da API).
  horarioLiberado = computed(() => this.terapia().horarioLiberado);

  bloqueado(p: PacienteTerapia): boolean {
    return !this.podeRegistrar() || this.cancelada() || this.idPacienteSalvando() === p.idCadastro;
  }

  marcar(p: PacienteTerapia, presenca: Presenca, justificativa: string | null = null) {
    this.presencaMarcada.emit({ idPaciente: p.idCadastro, presenca, justificativa });
  }
}
