import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PacienteService } from '../../../core/services/paciente';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';
import { ROTULO_STATUS_PACIENTE } from '../../../shared/utils/rotulos.util';

const QTD_RECENTES = 6;

@Component({
  selector: 'app-dashboard-assistente-social',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardAssistenteSocial implements OnInit {
  private pacienteService = inject(PacienteService);
  private router = inject(Router);

  icones = ICONES;

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Visualizar Pacientes', descricao: 'Consultar dados de um paciente', icone: ICONES.gestaoPacientes, rota: '/assistente-social/pacientes' },
  ];

  // '—' enquanto carrega ou se a chamada falhar.
  totalPacientes = signal<number | string>('—');
  // Últimos pacientes cadastrados (GET /pacientes ordenado pela data de cadastro).
  recentes = signal<Atividade[]>([]);

  ngOnInit() {
    this.pacienteService.listar({ size: QTD_RECENTES, sort: 'dataCadastro,desc' }).subscribe({
      next: (pagina) => {
        this.totalPacientes.set(pagina.totalElements);
        this.recentes.set(
          pagina.content.map((p) => ({
            descricao: p.nome,
            tempoAtras: `${p.idade} anos · ${ROTULO_STATUS_PACIENTE[p.statusPaciente]}`,
            acoes: [{ label: 'Ver', acao: () => this.router.navigate(['/assistente-social/pacientes', p.idCadastro]) }],
          }))
        );
      },
    });
  }
}
