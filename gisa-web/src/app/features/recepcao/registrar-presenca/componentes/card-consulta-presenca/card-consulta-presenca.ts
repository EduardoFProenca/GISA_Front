import { Component, computed, input, output } from '@angular/core';
import { StatusTerapia } from '../../../../../core/models/consulta.model';
import {
  ConsultaDiaria,
  PacienteConsulta,
  StatusPresenca,
} from '../../../../../core/models/consulta-diaria.model';
import { LinhaPacientePresenca } from '../linha-paciente-presenca/linha-paciente-presenca';
import {
  LABEL_MODALIDADE,
  LABEL_STATUS,
  consultaLiberada,
  especialistasTexto,
  horarioConsulta,
} from '../../presenca.util';

export interface PresencaMarcada {
  idPaciente: number;
  presenca: StatusPresenca;
  justificativa: string | null;
}

@Component({
  selector: 'app-card-consulta-presenca',
  imports: [LinhaPacientePresenca],
  templateUrl: './card-consulta-presenca.html',
  styleUrl: './card-consulta-presenca.scss',
})
export class CardConsultaPresenca {
  consulta = input.required<ConsultaDiaria>();
  // idPaciente que está sendo salvo nesta consulta (null = nenhum)
  idPacienteSalvando = input<number | null>(null);

  presencaMarcada = output<PresencaMarcada>();

  StatusPresenca = StatusPresenca;

  horario = computed(() => horarioConsulta(this.consulta()));
  meta = computed(
    () => `${LABEL_MODALIDADE[this.consulta().modalidade]} · ${especialistasTexto(this.consulta())}`
  );
  labelStatus = computed(() => LABEL_STATUS[this.consulta().status]);
  cancelada = computed(() => this.consulta().status === StatusTerapia.CANCELADA);
  // Visual: todos os pacientes já tiveram a presença registrada.
  liberada = computed(() => consultaLiberada(this.consulta()));

  bloqueado(p: PacienteConsulta): boolean {
    return this.cancelada() || this.idPacienteSalvando() === p.idPaciente;
  }

  marcar(p: PacienteConsulta, presenca: StatusPresenca, justificativa: string | null = null) {
    this.presencaMarcada.emit({ idPaciente: p.idPaciente, presenca, justificativa });
  }
}