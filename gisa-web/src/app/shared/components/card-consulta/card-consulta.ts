import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONES } from '../../icons';

export interface ConsultaCard {
  id: string;
  nomePaciente: string;
  nomeEspecialista: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  modalidade: string;
  status: string;
}

@Component({
  selector: 'app-card-consulta',
  imports: [],
  templateUrl: './card-consulta.html',
  styleUrl: './card-consulta.scss',
})
export class CardConsulta {
  @Input() consulta!: ConsultaCard;
  icones = ICONES;

  private router = inject(Router);

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  get classeStatus(): string {
    return this.consulta.status.toLowerCase().replace('_', '-');
  }

  get dataFormatada(): string {
    const [dataIso, horaCompleta] = this.consulta.dataHoraInicio.split('T');
    const [ano, mes, dia] = dataIso.split('-');
    const hora = horaCompleta?.slice(0, 5) ?? '';
    return `${dia}/${mes}/${ano} às ${hora}`;
  }

  abrirDetalheProfissional(event: Event) {
    event.stopPropagation();
    // TODO(Kauã): sem idProfissional na consulta mockada ainda; ligar quando a API expuser o vínculo.
  }
}