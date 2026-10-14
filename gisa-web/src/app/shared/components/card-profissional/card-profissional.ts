import { CampoDetalhe } from '../campo-detalhe/campo-detalhe';
import { Component, Input, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import { ICONES } from '../../icons';

export interface ProfissionalCard {
  id: string;
  nome: string;
  cargo: string;
  crm: string;
  statusCadastro: string;
}

@Component({
  selector: 'app-card-profissional',
  imports: [CampoDetalhe, NgIcon],
  templateUrl: './card-profissional.html',
  styleUrl: './card-profissional.scss',
})
export class CardProfissional {
  @Input() profissional!: ProfissionalCard;
  @Input() podeEditar = true;
  icones = ICONES;

  private router = inject(Router);


  abrirDetalhe() {
    this.router.navigateByUrl(`/administrador/profissionais/${this.profissional.id}`);
  }

  abrirEdicao(event: Event) {
    event.stopPropagation();
    this.router.navigateByUrl(`/administrador/profissionais/${this.profissional.id}/editar`);
  }

  abrirHistorico(event: Event) {
    event.stopPropagation();
    this.router.navigateByUrl(`/administrador/profissionais/${this.profissional.id}/historico`);
  }

  get classeStatus(): string {
    return this.profissional.statusCadastro.toLowerCase();
  }
}