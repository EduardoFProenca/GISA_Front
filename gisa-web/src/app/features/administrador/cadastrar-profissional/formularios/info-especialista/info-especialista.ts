import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mascara } from '../../../../../shared/directives/mascara.directive';
import { ComErros } from '../../../../../shared/components/com-erros';
import { SeletorHora } from '../../../../../shared/components/seletor-hora/seletor-hora';
import { Especialidade } from '../../../../../core/models/especialidade.model';
import { JornadaForm, OpcaoEspecialidade } from '../../models/formularios-cadastro';
import { Filtro } from '../../../../../shared/directives/filtro.directive';

export type Jornada = JornadaForm;

// Eager: os erros (ComErros) chegam depois da resposta da API e precisam aparecer.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-info-especialista',
  imports: [FormsModule, Mascara, SeletorHora, Filtro],
  templateUrl: './info-especialista.html',
  styleUrl: './info-especialista.scss',
})
export class InfoEspecialista extends ComErros implements OnInit {
  @Input() dadosIniciais?: Partial<InfoEspecialista>;
  @Input() somenteLeitura: boolean = false;
  // Edição: o tipo do cadastro (especialista/PJ), o registro e o CNPJ não mudam.
  @Input() bloquearTipo: boolean = false;

  // GET /especialidades
  @Input() set especialidadesDisponiveis(lista: Especialidade[]) {
    this.opcoesEspecialidade = lista.map((e) => ({ valor: String(e.idEspecialidade), label: e.nome }));
  }

  ehEspecialista: boolean = false;
  registroProfissional: string = '';
  atuaComoPJ: boolean = false;
  cnpj: string = '';
  razaoSocial: string = '';
  nomeFantasia: string = '';
  inscricaoEstadual: string = '';

  opcoesEspecialidade: OpcaoEspecialidade[] = [];

  // idEspecialidade (como texto, valor do select).
  especialidades: string[] = [''];

  // diaSemana da API: 1 = Segunda ... 7 = Domingo.
  diasSemana = [
    { valor: 1, label: 'Segunda' },
    { valor: 2, label: 'Terça' },
    { valor: 3, label: 'Quarta' },
    { valor: 4, label: 'Quinta' },
    { valor: 5, label: 'Sexta' },
    { valor: 6, label: 'Sábado' },
    { valor: 7, label: 'Domingo' },
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
