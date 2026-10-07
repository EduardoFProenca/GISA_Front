import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONES } from '../../icons';
import { Modalidade, StatusTerapia } from '../../../core/models/consulta.model';

export type TipoParticipante = 'PACIENTE' | 'ESPECIALISTA';

export interface ParticipanteConsulta {
  id: string;
  nome: string;
  tipo: TipoParticipante;
}

export interface ConsultaCard {
  id: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  modalidade: Modalidade;
  status: StatusTerapia;
  participantes: ParticipanteConsulta[];
}

const LABEL_STATUS: Record<StatusTerapia, string> = {
  [StatusTerapia.AGENDADA]: 'Agendada',
  [StatusTerapia.CONCLUIDA]: 'Concluída',
  [StatusTerapia.CANCELADA]: 'Cancelada',
  [StatusTerapia.EM_ATENDIMENTO]: 'Em atendimento',
};

const LABEL_MODALIDADE: Record<Modalidade, string> = {
  [Modalidade.INDIVIDUAL]: 'Individual',
  [Modalidade.COLETIVA]: 'Coletiva',
};

// Quantos chips de participantes aparecem antes de virar "+N".
const MAX_CHIPS = 3;

function plural(n: number, singular: string, pluralTxt: string): string {
  return `${n} ${n === 1 ? singular : pluralTxt}`;
}

// "Dra. Ana Maria Souza" -> "Ana Souza"
function nomeCurto(nome: string): string {
  const semTitulo = nome.trim().replace(/^(dr|dra|prof|profa)\.?\s+/i, '');
  const partes = semTitulo.split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1]}` : partes[0];
}

@Component({
  selector: 'app-card-consulta',
  imports: [],
  templateUrl: './card-consulta.html',
  styleUrl: './card-consulta.scss',
})
export class CardConsulta {
  @Input() consulta!: ConsultaCard;

  // Todos emitem o id da consulta; quem decide o que fazer é a tela.
  @Output() verDetalhes = new EventEmitter<string>();
  @Output() editar = new EventEmitter<string>();
  @Output() cancelar = new EventEmitter<string>();
  @Output() adicionarPessoas = new EventEmitter<string>();

  icones = ICONES;
  private sanitizer = inject(DomSanitizer);

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // --- Tipo e status ---

  get ehColetiva(): boolean {
    return this.consulta.modalidade === Modalidade.COLETIVA;
  }

  get icone(): string {
    return this.ehColetiva ? this.icones.grupoPessoas : this.icones.pessoa;
  }

  get labelModalidade(): string {
    return LABEL_MODALIDADE[this.consulta.modalidade];
  }

  get labelStatus(): string {
    return LABEL_STATUS[this.consulta.status];
  }

  // 'EM_ATENDIMENTO' -> 'em-atendimento' (bate com as classes do scss)
  get classeStatus(): string {
    return this.consulta.status.toLowerCase().replace('_', '-');
  }

  // --- Regras dos botões ---

  get podeEditar(): boolean {
    return this.consulta.status === StatusTerapia.AGENDADA;
  }

  get podeCancelar(): boolean {
    return this.consulta.status === StatusTerapia.AGENDADA;
  }

  get podeAdicionar(): boolean {
    return (
      this.ehColetiva &&
      (this.consulta.status === StatusTerapia.AGENDADA ||
        this.consulta.status === StatusTerapia.EM_ATENDIMENTO)
    );
  }

  // --- Participantes ---

  private get pacientes(): ParticipanteConsulta[] {
    return this.consulta.participantes.filter((p) => p.tipo === 'PACIENTE');
  }

  private get especialistas(): ParticipanteConsulta[] {
    return this.consulta.participantes.filter((p) => p.tipo === 'ESPECIALISTA');
  }

  get titulo(): string {
    if (this.ehColetiva) return 'Terapia coletiva';
    return this.pacientes[0]?.nome ?? 'Sem paciente';
  }

  get subtitulo(): string {
    if (this.ehColetiva) {
      return `${plural(this.pacientes.length, 'paciente', 'pacientes')} · ${plural(this.especialistas.length, 'especialista', 'especialistas')}`;
    }
    const nomes = this.especialistas.map((e) => e.nome).join(', ');
    return nomes ? `com ${nomes}` : 'Sem especialista';
  }

  // Especialistas primeiro, depois pacientes.
  private get ordenados(): ParticipanteConsulta[] {
    return [...this.especialistas, ...this.pacientes];
  }

  get visiveis(): ParticipanteConsulta[] {
    return this.ordenados.slice(0, MAX_CHIPS);
  }

  get ocultos(): number {
    return Math.max(0, this.ordenados.length - MAX_CHIPS);
  }

  get nomesOcultos(): string {
    return this.ordenados.slice(MAX_CHIPS).map((p) => p.nome).join(', ');
  }

  nomeCurto(nome: string): string {
    return nomeCurto(nome);
  }

  tooltip(p: ParticipanteConsulta): string {
    return `${p.nome} · ${p.tipo === 'ESPECIALISTA' ? 'Especialista' : 'Paciente'}`;
  }

  // --- Data e hora ---

  get data(): string {
    const [ano, mes, dia] = this.consulta.dataHoraInicio.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  }

  get horario(): string {
    const inicio = this.consulta.dataHoraInicio.split('T')[1]?.slice(0, 5) ?? '';
    const fim = this.consulta.dataHoraFim.split('T')[1]?.slice(0, 5) ?? '';
    return fim ? `${inicio} – ${fim}` : inicio;
  }
}