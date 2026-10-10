import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONES } from '../../../../shared/icons';
import { PacienteLista } from '../../../../core/models/paciente-resumo.model';
import { StatusPaciente } from '../../../../core/models/paciente.model';
import { soDigitos } from '../../../../shared/utils/texto.util';

const ROTULO_STATUS: Record<StatusPaciente, string> = {
  MATRICULADO: 'Matriculado',
  ALTA: 'Alta',
  DESLIGADO: 'Desligado',
};

@Component({
  selector: 'app-card-paciente',
  imports: [],
  templateUrl: './card-paciente.html',
  styleUrl: './card-paciente.scss'
})
export class CardPacienteComponent {
  @Input() paciente!: PacienteLista;
  icones = ICONES;

  private router = inject(Router);

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // A API devolve o CPF sem máscara.
  get cpfFormatado(): string {
    const d = soDigitos(this.paciente?.cpf);
    return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : (this.paciente?.cpf ?? '');
  }

  get nomeResponsavel(): string {
    const lista = this.paciente?.responsaveis ?? [];
    if (lista.length === 0) return 'Sem responsável';
    return lista.length > 1 ? `${lista[0].nome} +${lista.length - 1}` : lista[0].nome;
  }

  get cidPrincipal(): string {
    const lista = this.paciente?.cids ?? [];
    if (lista.length === 0) return 'Nenhum CID';
    const extra = lista.length > 1 ? ` (+${lista.length - 1})` : '';
    return `${lista[0].codigoCID} - ${lista[0].descricao}${extra}`;
  }

  get classeStatus(): string {
    return (this.paciente?.statusPaciente ?? '').toLowerCase();
  }

  get rotuloStatus(): string {
    return ROTULO_STATUS[this.paciente?.statusPaciente] ?? '';
  }

  abrirDetalhe(): void {
    this.router.navigateByUrl(`/administrador/pacientes/${this.paciente.idCadastro}`);
  }

  abrirEdicao(event: Event): void {
    event.stopPropagation();
    this.router.navigateByUrl(`/administrador/pacientes/${this.paciente.idCadastro}/editar`);
  }
}
