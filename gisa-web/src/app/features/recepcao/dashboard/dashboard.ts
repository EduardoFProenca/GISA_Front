import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';
import { hojeIso } from '../../../shared/utils/data.util';
import { TerapiaService } from '../../../core/services/terapia';
import { ACOES_RAPIDAS_RECEPCIONISTA } from '../acoes-rapidas';
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

  icones = ICONES;
  acoesRapidas = ACOES_RAPIDAS_RECEPCIONISTA;

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
