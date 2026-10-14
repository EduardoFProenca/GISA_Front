import { Component, Input, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import { ICONES } from '../../../../shared/icons';
import { PacienteResumo } from '../../../../core/models/paciente.model';
import { ROTA_BASE_ADMIN } from '../../contexto-pacientes';
import { soDigitos } from '../../../../shared/utils/texto.util';
import { ROTULO_STATUS_PACIENTE } from '../../../../shared/utils/rotulos.util';


@Component({
  selector: 'app-card-paciente',
  imports: [NgIcon],
  templateUrl: './card-paciente.html',
  styleUrl: './card-paciente.scss'
})
export class CardPacienteComponent {
  @Input() paciente!: PacienteResumo;
  @Input() somenteLeitura = false;
  @Input() rotaBase = ROTA_BASE_ADMIN;
  icones = ICONES;

  private router = inject(Router);


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
    return ROTULO_STATUS_PACIENTE[this.paciente?.statusPaciente] ?? '';
  }

  abrirDetalhe(): void {
    this.router.navigateByUrl(`${this.rotaBase}/${this.paciente.idCadastro}`);
  }

  abrirEdicao(event: Event): void {
    event.stopPropagation();
    if (this.somenteLeitura) return;
    this.router.navigateByUrl(`${this.rotaBase}/${this.paciente.idCadastro}/editar`);
  }
}
