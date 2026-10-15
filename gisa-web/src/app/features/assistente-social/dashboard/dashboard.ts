import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProfissionalService } from '../../../core/services/profissional';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent } from '../../../shared/components/painel-acoes/painel-acoes';
import { Auth } from '../../../core/auth/auth';
import { acoesRapidasDoPainel } from '../../../core/layout/menus';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';

@Component({
  selector: 'app-dashboard-assistente-social',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardAssistenteSocial implements OnInit {
  private profissionalService = inject(ProfissionalService);
  private router = inject(Router);
  private auth = inject(Auth);

  icones = ICONES;

  // Mesmo catálogo do menu lateral, filtrado pelas permissões (core/layout/menus.ts).
  acoesRapidas = acoesRapidasDoPainel('ASSISTENTE_SOCIAL', (f) => this.auth.temPermissao(f));

  // '—' enquanto carrega ou se a chamada falhar (ex.: quem abre o painel não é assistente social).
  totalPacientes = signal<number | string>('—');
  // Pacientes vinculados ao assistente social logado (GET /assistentes-sociais/me/pacientes).
  meusPacientes = signal<Atividade[]>([]);

  ngOnInit() {
    this.profissionalService.meusPacientesAssistenteSocial().subscribe({
      next: (lista) => {
        this.totalPacientes.set(lista.length);
        this.meusPacientes.set(
          lista.map((p) => ({
            descricao: p.nome,
            tempoAtras: `CPF ${p.cpfMascarado}${p.statusCadastro === 'INATIVO' ? ' · cadastro inativo' : ''}`,
            acoes: [{ label: 'Ver', acao: () => this.router.navigate(['/assistente-social/pacientes', p.idCadastro]) }],
          }))
        );
      },
    });
  }
}
