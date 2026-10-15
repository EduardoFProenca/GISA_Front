import { Component, OnInit, inject, signal } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent } from '../../../shared/components/painel-acoes/painel-acoes';
import { Auth } from '../../../core/auth/auth';
import { acoesRapidasDoPainel } from '../../../core/layout/menus';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';
import { ProfissionalService } from '../../../core/services/profissional';
import { TerapiaService } from '../../../core/services/terapia';
import { Router } from '@angular/router';
import { terapiasDeHoje } from '../../terapias/terapias-hoje';

@Component({
  selector: 'app-dashboard-administrador',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardAdministrador implements OnInit {
  private profissionalService = inject(ProfissionalService);
  private terapiaService = inject(TerapiaService);
  private router = inject(Router);
  private auth = inject(Auth);

  icones = ICONES;

  // '—' enquanto carrega ou se a chamada falhar.
  totalProfissionais = signal<number | string>('—');
  profissionaisAtivos = signal<number | string>('—');

  // Mesmo catálogo do menu lateral, filtrado pelas permissões (core/layout/menus.ts).
  acoesRapidas = acoesRapidasDoPainel('ADMINISTRADOR', (f) => this.auth.temPermissao(f));

  terapiasHoje = signal<Atividade[]>([]);

  ngOnInit() {
    terapiasDeHoje(this.terapiaService, (t) => this.router.navigate(['/administrador/terapias', t.idTerapia])).subscribe({
      next: ({ atividades }) => this.terapiasHoje.set(atividades),
    });

    // size=1: só o total interessa, não a lista. (Pacientes não têm total: a API só faz busca, por LGPD.)
    this.profissionalService.listar({ size: 1 }).subscribe({
      next: (pagina) => this.totalProfissionais.set(pagina.totalElements),
    });
    this.profissionalService.listar({ size: 1, statusCadastro: 'ATIVO' }).subscribe({
      next: (pagina) => this.profissionaisAtivos.set(pagina.totalElements),
    });
  }
}