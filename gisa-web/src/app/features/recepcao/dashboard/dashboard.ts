import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';
import { hojeIso } from '../../../shared/utils/data.util';
import { TerapiaService } from '../../../core/services/terapia';
import { Auth } from '../../../core/auth/auth';
import { acoesRapidasDoPainel } from '../../../core/layout/menus';
import { calcularResumo, ResumoPresenca } from '../../terapias/registrar-presenca/presenca.util';
import { terapiasDeHoje } from '../../terapias/terapias-hoje';

@Component({
  selector: 'app-dashboard-recepcao',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardRecepcao implements OnInit {
  private terapiaService = inject(TerapiaService);
  private router = inject(Router);
  private auth = inject(Auth);

  icones = ICONES;
  // Mesmo catálogo do menu lateral, filtrado pelas permissões (core/layout/menus.ts).
  acoesRapidas = acoesRapidasDoPainel('RECEPCAO', (f) => this.auth.temPermissao(f));

  resumo = signal<ResumoPresenca | null>(null);
  terapiasHoje = signal<Atividade[]>([]);

  ngOnInit() {
    // Resumo do dia (até 100 terapias, o máximo de uma página da API).
    this.terapiaService.listar({ data: hojeIso(), size: 100 }).subscribe({
      next: (p) => this.resumo.set(calcularResumo(p.content)),
    });
    terapiasDeHoje(this.terapiaService, (t) => this.router.navigate(['/recepcao/terapias', t.idTerapia])).subscribe({
      next: ({ atividades }) => this.terapiasHoje.set(atividades),
    });
  }
}
