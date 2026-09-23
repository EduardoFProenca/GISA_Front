import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Jornada {
  diaSemana: string;
  horaInicio: string;
  horaTermino: string;
}

@Component({
  selector: 'app-info-especialista',
  imports: [FormsModule],
  templateUrl: './info-especialista.html',
  styleUrl: './info-especialista.scss',
})
export class InfoEspecialista {
  ehEspecialista: boolean = false;

  registroProfissional: string = '';
  estadoRegistro: string = '';
  atuaComoPJ: boolean = false;

  cnpj: string = '';
  razaoSocial: string = '';
  nomeFantasia: string = '';
  inscricaoEstadual: string = '';

  opcoesEspecialidade = [
    { valor: 'clinica-geral', label: 'Clínica Geral' },
    { valor: 'pediatria', label: 'Pediatria' },
    { valor: 'neurologia', label: 'Neurologia' },
    { valor: 'psiquiatria', label: 'Psiquiatria' },
    { valor: 'fisioterapia', label: 'Fisioterapia' },
    { valor: 'fonoaudiologia', label: 'Fonoaudiologia' },
    { valor: 'terapia-ocupacional', label: 'Terapia Ocupacional' },
    { valor: 'assistencia-social', label: 'Assistência Social' },
  ];

  especialidades: string[] = [''];

  adicionarEspecialidade() {
    this.especialidades.push('');
  }

  removerEspecialidade(index: number) {
    if (this.especialidades.length > 1) {
      this.especialidades.splice(index, 1);
    }
  }

  diasSemana = [
    { valor: 1, label: 'Segunda' },
    { valor: 2, label: 'Terça' },
    { valor: 3, label: 'Quarta' },
    { valor: 4, label: 'Quinta' },
    { valor: 5, label: 'Sexta' },
    { valor: 6, label: 'Sábado' },
  ];

  jornadas: Jornada[] = [
    { diaSemana: '', horaInicio: '', horaTermino: '' }
  ];

  adicionarJornada() {
    this.jornadas.push({ diaSemana: '', horaInicio: '', horaTermino: '' });
  }

  removerJornada(index: number) {
    if (this.jornadas.length > 1) {
      this.jornadas.splice(index, 1);
    }
  }
}