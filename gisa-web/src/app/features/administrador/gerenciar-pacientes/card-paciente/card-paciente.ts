import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONES } from '../../../../shared/icons'; // Ajuste o caminho se necessário
import { Paciente } from '../../../../core/models/paciente.model';

@Component({
  selector: 'app-card-paciente',
  imports: [],
  templateUrl: './card-paciente.html',
  styleUrl: './card-paciente.scss'
})
export class CardPacienteComponent {
  @Input() paciente!: Paciente;
  icones = ICONES;

  private router = inject(Router);

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  get idade(): number {
    if (!this.paciente?.dataNascimento) return 0;
    const anoNasc = new Date(this.paciente.dataNascimento).getFullYear();
    const anoAtual = new Date().getFullYear();
    return anoAtual - anoNasc;
  }

  get nomeResponsavel(): string {
    return this.paciente?.vinculosResponsavel?.[0]?.responsavel?.nome || 'Sem responsável';
  }

  get cidPrincipal(): string {
    if (!this.paciente?.cids || this.paciente.cids.length === 0) return 'Nenhum CID';
    return `${this.paciente.cids[0].codigoCID} - ${this.paciente.cids[0].descricao}`;
  }

  get classeStatus(): string {
    return (this.paciente?.statusPaciente || 'ativo').toLowerCase();
  }

  abrirDetalhe(): void {
    this.router.navigateByUrl(`/administrador/pacientes/${this.paciente.idPaciente}`);
  }

  abrirEdicao(event: Event): void {
    event.stopPropagation();
    this.router.navigateByUrl(`/administrador/pacientes/${this.paciente.idPaciente}/editar`);
  }
}