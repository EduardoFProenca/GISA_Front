import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';
import { hojeIso } from '../../../shared/utils/data.util';
import { ROTULO_STATUS_TERAPIA } from '../../../shared/utils/rotulos.util';
import { TerapiaService } from '../../../core/services/terapia';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { calcularResumo, horarioTerapia, ResumoPresenca } from '../../terapias/registrar-presenca/presenca.util';

@Component({
  selector: 'app-dashboard-especialista',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardEspecialista implements OnInit {
  private terapiaService = inject(TerapiaService);
  private router = inject(Router);

  icones = ICONES;

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Minhas Terapias', descricao: 'Terapias do dia e presença', iconeSvg: ICONES.calendario, rota: '/especialista/minhas-terapias' },
    { titulo: 'Emitir Receita', descricao: 'Nova receita', iconeSvg: ICONES.gestaoAtividades, rota: '/especialista/receita' },
    { titulo: 'Emitir Atestado', descricao: 'Novo atestado', iconeSvg: ICONES.cadastrarPaciente, rota: '/especialista/atestado' },
  ];

  resumo = signal<ResumoPresenca | null>(null);
  terapiasHoje = signal<Atividade[]>([]);
  aviso = signal('');

  ngOnInit() {
    // /minhas responde 400 se o usuário logado não for especialista (ex.: administrador).
    this.terapiaService.minhas({ data: hojeIso(), size: 100, sort: 'dataHoraInicio,asc' }).subscribe({
      next: (p) => {
        this.resumo.set(calcularResumo(p.content));
        this.terapiasHoje.set(
          p.content.map((t) => ({
            descricao: `${horarioTerapia(t)} · ${t.titulo}`,
            tempoAtras: ROTULO_STATUS_TERAPIA[t.status],
            acoes: [{ label: 'Ver', acao: () => this.router.navigate(['/especialista/terapias', t.idTerapia]) }],
          }))
        );
      },
      error: (err) => this.aviso.set(mensagemDeErro(err, 'Não foi possível carregar suas terapias.')),
    });
  }
}
