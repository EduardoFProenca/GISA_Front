import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONES } from '../../../../shared/icons';
import { Terapia } from '../../../../core/models/terapia.model';
import { ROTULO_MODALIDADE, ROTULO_STATUS_TERAPIA } from '../../../../shared/utils/rotulos.util';
import { dataCurta } from '../../../../shared/utils/data.util';
import { horarioTerapia } from '../../registrar-presenca/presenca.util';

export type TipoParticipante = 'PACIENTE' | 'ESPECIALISTA';

interface Participante {
  id: string;
  nome: string;
  tipo: TipoParticipante;
}

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
  selector: 'app-card-terapia',
  imports: [],
  templateUrl: './card-terapia.html',
  styleUrl: './card-terapia.scss',
})
export class CardTerapia {
  @Input() terapia!: Terapia;

  // Permissões de quem está vendo (a tela decide).
  @Input() permitirEditar: boolean = true;
  @Input() permitirCancelar: boolean = true;

  // Todos emitem o id da terapia; quem decide o que fazer é a tela.
  @Output() verDetalhes = new EventEmitter<number>();
  @Output() editar = new EventEmitter<number>();
  @Output() cancelar = new EventEmitter<number>();

  icones = ICONES;
  private sanitizer = inject(DomSanitizer);

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // --- Tipo e status ---

  get ehColetiva(): boolean {
    return this.terapia.modalidade === 'COLETIVA';
  }

  get icone(): string {
    return this.ehColetiva ? this.icones.grupoPessoas : this.icones.pessoa;
  }

  get labelModalidade(): string {
    return ROTULO_MODALIDADE[this.terapia.modalidade];
  }

  get labelStatus(): string {
    return this.terapia.horarioLiberado ? 'Horário liberado' : ROTULO_STATUS_TERAPIA[this.terapia.status];
  }

  // 'EM_ATENDIMENTO' -> 'em-atendimento' (bate com as classes do scss)
  get classeStatus(): string {
    return this.terapia.status.toLowerCase().replace('_', '-');
  }

  // --- Regras dos botões (transições da API) ---

  get podeEditar(): boolean {
    return this.permitirEditar && this.terapia.status === 'AGENDADA';
  }

  get podeCancelar(): boolean {
    return this.permitirCancelar && (this.terapia.status === 'AGENDADA' || this.terapia.status === 'EM_ATENDIMENTO');
  }

  // --- Participantes ---

  get titulo(): string {
    return this.terapia.titulo;
  }

  get subtitulo(): string {
    const t = this.terapia;
    if (this.ehColetiva) {
      return `${plural(t.pacientes.length, 'paciente', 'pacientes')} · ${plural(t.especialistas.length, 'especialista', 'especialistas')}`;
    }
    const nomes = t.especialistas.map((e) => e.nome).join(', ');
    return nomes ? `com ${nomes}` : 'Sem especialista';
  }

  // Especialistas primeiro, depois pacientes.
  private get participantes(): Participante[] {
    return [
      ...this.terapia.especialistas.map((e) => ({ id: `e${e.idCadastro}`, nome: e.nome, tipo: 'ESPECIALISTA' as const })),
      ...this.terapia.pacientes.map((p) => ({ id: `p${p.idCadastro}`, nome: p.nome, tipo: 'PACIENTE' as const })),
    ];
  }

  get visiveis(): Participante[] {
    return this.participantes.slice(0, MAX_CHIPS);
  }

  get ocultos(): number {
    return Math.max(0, this.participantes.length - MAX_CHIPS);
  }

  get nomesOcultos(): string {
    return this.participantes.slice(MAX_CHIPS).map((p) => p.nome).join(', ');
  }

  nomeCurto(nome: string): string {
    return nomeCurto(nome);
  }

  tooltip(p: Participante): string {
    return `${p.nome} · ${p.tipo === 'ESPECIALISTA' ? 'Especialista' : 'Paciente'}`;
  }

  // --- Data e hora ---

  get data(): string {
    return dataCurta(this.terapia.data);
  }

  get horario(): string {
    return horarioTerapia(this.terapia);
  }
}
