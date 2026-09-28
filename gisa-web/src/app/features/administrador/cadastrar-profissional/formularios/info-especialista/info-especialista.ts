import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';

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
export class InfoEspecialista extends ComErros implements OnInit {
  @Input() dadosIniciais?: Partial<InfoEspecialista>;
  @Input() somenteLeitura: boolean = false;

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

  diasSemana = [
    { valor: 1, label: 'Segunda' },
    { valor: 2, label: 'Terça' },
    { valor: 3, label: 'Quarta' },
    { valor: 4, label: 'Quinta' },
    { valor: 5, label: 'Sexta' },
    { valor: 6, label: 'Sábado' },
  ];

  jornadas: Jornada[] = [{ diaSemana: '', horaInicio: '', horaTermino: '' }];

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
  }

  adicionarEspecialidade() {
    if (this.somenteLeitura) return;
    this.especialidades.push('');
  }

  removerEspecialidade(index: number) {
    if (this.somenteLeitura) return;
    if (this.especialidades.length > 1) this.especialidades.splice(index, 1);
  }

  adicionarJornada() {
    if (this.somenteLeitura) return;
    this.jornadas.push({ diaSemana: '', horaInicio: '', horaTermino: '' });
  }

  removerJornada(index: number) {
    if (this.somenteLeitura) return;
    if (this.jornadas.length > 1) this.jornadas.splice(index, 1);
  }
}