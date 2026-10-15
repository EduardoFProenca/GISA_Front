import { CampoDetalhe } from '../../../../shared/components/campo-detalhe/campo-detalhe';
import { Component, Input, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import { ICONES } from '../../../../shared/icons';
import { PacienteResumo } from '../../../../core/models/paciente.model';
import { ROTA_BASE_ADMIN } from '../../contexto-pacientes';
import { ROTULO_STATUS_CADASTRO } from '../../../../shared/utils/rotulos.util';

// Resultado da busca de pacientes: só nome, CPF mascarado e situação do cadastro (LGPD).
@Component({
  selector: 'app-card-paciente',
  imports: [CampoDetalhe, NgIcon],
  templateUrl: './card-paciente.html',
  styleUrl: './card-paciente.scss'
})
export class CardPacienteComponent {
  @Input() paciente!: PacienteResumo;
  @Input() somenteLeitura = false;
  @Input() rotaBase = ROTA_BASE_ADMIN;
  icones = ICONES;

  private router = inject(Router);

  get classeStatus(): string {
    return (this.paciente?.statusCadastro ?? '').toLowerCase();
  }

  get rotuloStatus(): string {
    return ROTULO_STATUS_CADASTRO[this.paciente?.statusCadastro] ?? '';
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
