import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONES } from '../../../../shared/icons';

export interface ProfissionalCard {
  id: string;
  nome: string;
  cargo: string;
  crm: string;
  statusCadastro: string;
}

@Component({
  selector: 'app-card-profissional',
  imports: [],
  templateUrl: './card-profissional.html',
  styleUrl: './card-profissional.scss',
})

export class CardProfissional {
  @Input() profissional!: ProfissionalCard;
  icones = ICONES;

  private router = inject(Router);

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  abrirDetalhe() {
    this.router.navigateByUrl(`/administrador/profissionais/${this.profissional.id}`);
  }

  abrirEdicao(event: Event) {
    event.stopPropagation();
    this.router.navigateByUrl(`/administrador/profissionais/${this.profissional.id}/editar`);
  }

  get classeStatus(): string {
    return this.profissional.statusCadastro.toLowerCase();
  }

    todosProfissionais: ProfissionalCard[] = [
    { id: '1', nome: 'Dr. Roberto Almeida', cargo: 'Médico', crm: 'CRM-SP 123456', statusCadastro: 'Ativo' },
    { id: '2', nome: 'Dra. Ana Souza', cargo: 'Médico', crm: 'CRM-SP 654321', statusCadastro: 'Ativo' },
    { id: '3', nome: 'Carlos Mendes', cargo: 'Assistente Social', crm: 'CREFITO-3 98765', statusCadastro: 'Inativo' },
  ];
}