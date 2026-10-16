import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth/auth';
import { mensagemDeErro } from '../../core/http/erro-api';
import { acoesRapidas } from '../../core/layout/menus';
import { ItemAgenda } from '../../core/models/agenda-especialista.model';
import { AgendaEspecialistaService } from '../../core/services/agenda-especialista';
import { ProfissionalService } from '../../core/services/profissional';
import { TerapiaService } from '../../core/services/terapia';
import { AtividadesRecentes, Atividade } from '../../shared/components/atividades-recentes/atividades-recentes';
import { CardEstatistica } from '../../shared/components/card-estatistica/card-estatistica';
import { Header } from '../../shared/components/header/header';
import { PainelAcoesComponent } from '../../shared/components/painel-acoes/painel-acoes';
import { ICONES } from '../../shared/icons';
import { hojeIso } from '../../shared/utils/data.util';
import { ROTULO_MODALIDADE } from '../../shared/utils/rotulos.util';
import { ROTULO_STATUS_AGENDA, proximoPaciente, resumoDoDia, statusAgenda } from '../especialista/agenda/agenda.util';
import { calcularResumo, ResumoPresenca } from '../terapias/registrar-presenca/presenca.util';
import { terapiasDeHoje } from '../terapias/terapias-hoje';

// Página inicial única. Cada bloco aparece conforme as permissões do usuário (ou, nos blocos
// "meus", conforme o tipo de cadastro), qualquer que seja o nome do perfil:
// - Gestão Rápida: as telas liberadas (core/layout/menus.ts);
// - terapias e presenças de hoje: VISUALIZAR_TERAPIAS;
// - totais de profissionais: VISUALIZAR_PROFISSIONAIS;
// - meus atendimentos e próximo paciente: cadastro de especialista (/terapias/minhas);
// - meus pacientes: cadastro de assistente social (/assistentes-sociais/me/pacientes).
@Component({
  selector: 'app-inicio',
  imports: [CardEstatistica, Header, PainelAcoesComponent, AtividadesRecentes, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private terapiaService = inject(TerapiaService);
  private profissionalService = inject(ProfissionalService);
  private agendaService = inject(AgendaEspecialistaService);
  private destroyRef = inject(DestroyRef);

  icones = ICONES;
  readonly rotuloStatus = ROTULO_STATUS_AGENDA;
  readonly rotuloModalidade = ROTULO_MODALIDADE;
  readonly statusDe = statusAgenda;

  // O que este usuário vê no Início.
  readonly veTerapias = this.auth.temPermissao('VISUALIZAR_TERAPIAS');
  readonly veProfissionais = this.auth.temPermissao('VISUALIZAR_PROFISSIONAIS');
  readonly vePacientes = this.auth.temPermissao('VISUALIZAR_PACIENTES');
  readonly ehEspecialista = this.auth.ehEspecialista();
  readonly ehAssistenteSocial = this.auth.ehAssistenteSocial();
  readonly temCards = this.veTerapias || this.veProfissionais || this.ehEspecialista || this.ehAssistenteSocial;
  readonly temColunaLateral = this.veTerapias || this.ehEspecialista || this.ehAssistenteSocial;

  // Mesmo catálogo do menu lateral, filtrado pelas permissões (core/layout/menus.ts).
  readonly acoes = acoesRapidas({
    pode: (f) => this.auth.temPermissao(f),
    temCadastro: (c) => this.auth.temCadastro(c),
  });
  // Perfil sem nenhuma tela liberada: só sobra trocar a senha.
  readonly semAcesso = !this.acoes.length && !this.temCards;

  // --- terapias de hoje (VISUALIZAR_TERAPIAS) ---
  resumoGeral = signal<ResumoPresenca | null>(null);
  terapiasHoje = signal<Atividade[]>([]);

  // --- profissionais (VISUALIZAR_PROFISSIONAIS); '—' enquanto carrega ou se a chamada falhar ---
  totalProfissionais = signal<number | string>('—');
  profissionaisAtivos = signal<number | string>('—');

  // --- meus atendimentos (especialista) ---
  // "Agora" em signal para o card "Próximo Paciente" acompanhar o relógio sem recarregar a tela.
  private agora = signal(new Date());
  carregandoAgenda = signal(true);
  avisoAgenda = signal('');
  doDia = signal<ItemAgenda[]>([]);
  resumoAgenda = computed(() => resumoDoDia(this.doDia()));
  proximo = computed(() => proximoPaciente(this.doDia(), this.agora()));

  // --- meus pacientes (assistente social) ---
  totalMeusPacientes = signal<number | string>('—');
  meusPacientes = signal<Atividade[]>([]);

  ngOnInit() {
    if (this.veTerapias) this.carregarTerapias();
    if (this.veProfissionais) this.carregarProfissionais();
    if (this.ehEspecialista) this.carregarAgenda();
    if (this.ehAssistenteSocial) this.carregarMeusPacientes();
  }

  abrirProntuario(idPaciente: number, idTerapia?: number) {
    this.router.navigate(['/atendimento', idPaciente], {
      queryParams: idTerapia ? { terapia: idTerapia } : {},
    });
  }

  private carregarTerapias() {
    // Resumo do dia (até 100 terapias, o máximo de uma página da API).
    this.terapiaService.listar({ data: hojeIso(), size: 100 }).subscribe({
      next: (p) => this.resumoGeral.set(calcularResumo(p.content)),
    });
    terapiasDeHoje(this.terapiaService, (t) => this.router.navigate(['/terapias', t.idTerapia])).subscribe({
      next: ({ atividades }) => this.terapiasHoje.set(atividades),
    });
  }

  private carregarProfissionais() {
    // size=1: só o total interessa, não a lista. (Pacientes não têm total: a API só faz busca, por LGPD.)
    this.profissionalService.listar({ size: 1 }).subscribe({
      next: (pagina) => this.totalProfissionais.set(pagina.totalElements),
    });
    this.profissionalService.listar({ size: 1, statusCadastro: 'ATIVO' }).subscribe({
      next: (pagina) => this.profissionaisAtivos.set(pagina.totalElements),
    });
  }

  private carregarAgenda() {
    const relogio = setInterval(() => this.agora.set(new Date()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(relogio));

    const hoje = hojeIso();
    this.agendaService.listarPeriodo(hoje, hoje).subscribe({
      next: (lista) => {
        this.doDia.set(lista);
        this.carregandoAgenda.set(false);
      },
      error: (err) => {
        this.carregandoAgenda.set(false);
        this.avisoAgenda.set(mensagemDeErro(err, 'Não foi possível carregar a agenda de hoje.'));
      },
    });
  }

  private carregarMeusPacientes() {
    this.profissionalService.meusPacientesAssistenteSocial().subscribe({
      next: (lista) => {
        this.totalMeusPacientes.set(lista.length);
        this.meusPacientes.set(
          lista.map((p) => ({
            descricao: p.nome,
            tempoAtras: `CPF ${p.cpfMascarado}${p.statusCadastro === 'INATIVO' ? ' · cadastro inativo' : ''}`,
            acoes: this.vePacientes
              ? [{ label: 'Ver', acao: () => this.router.navigate(['/pacientes', p.idCadastro]) }]
              : [],
          }))
        );
      },
    });
  }
}
