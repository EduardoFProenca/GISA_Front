import { Component, OnInit, inject, signal } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent } from '../../../shared/components/painel-acoes/painel-acoes';
import { Auth } from '../../../core/auth/auth';
import { acoesRapidasDoPainel } from '../../../core/layout/menus';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';
import { PacienteService } from '../../../core/services/paciente';
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
  private pacienteService = inject(PacienteService);
  private profissionalService = inject(ProfissionalService);
  private terapiaService = inject(TerapiaService);
  private router = inject(Router);
  private auth = inject(Auth);

  icones = ICONES;

  // '—' enquanto carrega ou se a chamada falhar.
  totalPacientes = signal<number | string>('—');
  totalProfissionais = signal<number | string>('—');
  profissionaisAtivos = signal<number | string>('—');

  // Mesmo catálogo do menu lateral, filtrado pelas permissões (core/layout/menus.ts).
  acoesRapidas = acoesRapidasDoPainel('ADMINISTRADOR', (f) => this.auth.temPermissao(f));

  terapiasHoje = signal<Atividade[]>([]);

  ngOnInit() {
    terapiasDeHoje(this.terapiaService, (t) => this.router.navigate(['/administrador/terapias', t.idTerapia])).subscribe({
      next: ({ atividades }) => this.terapiasHoje.set(atividades),
    });

    // size=1: só o total interessa, não a lista.
    this.pacienteService.listar({ page: 0, size: 1 }).subscribe({
      next: (pagina) => this.totalPacientes.set(pagina.totalElements),
    });

    this.profissionalService.listar({ size: 1 }).subscribe({
      next: (pagina) => this.totalProfissionais.set(pagina.totalElements),
    });
    this.profissionalService.listar({ size: 1, statusCadastro: 'ATIVO' }).subscribe({
      next: (pagina) => this.profissionaisAtivos.set(pagina.totalElements),
    });
  }
}