import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { BuscaFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import {
  EstadoFiltroAvancado,
  FiltroAvancado,
  OpcaoFiltroAvancado,
} from '../../../shared/components/filtro-avancado/filtro-avancado';
import { NavegadorData } from '../../../shared/components/navegador-data/navegador-data';
import { hojeIso } from '../../../shared/utils/data.util';
import { TerapiaService } from '../../../core/services/terapia';
import { Pagina } from '../../../core/models/comum.model';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { ResumoPresencaDia } from './componentes/resumo-presenca-dia/resumo-presenca-dia';
import { CardTerapiaPresenca, PresencaMarcada } from './componentes/card-terapia-presenca/card-terapia-presenca';
import { TerapiaDoDia, calcularResumo, filtrarPorSituacao, filtrarTerapias, substituirTerapia } from './presenca.util';

// Máximo aceito pela API em uma página.
const TAMANHO_DIA = 100;

// Terapias de um dia com registro de presença.
// data.modo = 'geral' (recepção: todas as terapias) ou 'minhas' (especialista logado).
@Component({
  selector: 'app-registrar-presenca',
  imports: [CabecalhoPagina, BuscaFiltro, FiltroAvancado, NavegadorData, ResumoPresencaDia, CardTerapiaPresenca, RouterLink],
  templateUrl: './registrar-presenca.html',
  styleUrl: './registrar-presenca.scss',
})
export class RegistrarPresenca implements OnInit {
  private terapiaService = inject(TerapiaService);
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);

  readonly minhas = this.route.snapshot.data['modo'] === 'minhas';
  readonly titulo = this.minhas ? 'Minhas Terapias' : 'Terapias do Dia';
  // Base das rotas de terapia do painel (para o link "Detalhes"); vazio = sem link.
  readonly rotaTerapias: string = this.route.snapshot.data['rotaTerapias'] ?? '';
  readonly podeRegistrar = this.auth.temPermissao('REGISTRAR_PRESENCA');

  data = signal(hojeIso());
  terapias = signal<TerapiaDoDia[]>([]);
  carregando = signal(true);
  erro = signal('');
  termoBusca = signal('');
  situacoes = signal<ReadonlySet<string>>(new Set());
  salvando = signal<{ idTerapia: number; idPaciente: number } | null>(null);

  // O dia é escolhido no navegador de data; o filtro avançado só tem a situação.
  situacoesDisponiveis: OpcaoFiltroAvancado[] = [
    { valor: 'PENDENTE', label: 'Presença pendente', cor: '#2563eb' },
    { valor: 'REGISTRADA', label: 'Presença registrada', cor: '#16a34a' },
    { valor: 'CANCELADA', label: 'Cancelada', cor: '#ef4444' },
  ];

  resumo = computed(() => calcularResumo(this.terapias()));
  terapiasFiltradas = computed(() =>
    filtrarPorSituacao(filtrarTerapias(this.terapias(), this.termoBusca()), this.situacoes())
  );

  // Evita que uma resposta antiga sobrescreva a de uma data escolhida depois.
  private requisicao = 0;

  ngOnInit() {
    this.carregar();
  }

  private buscarDoDia(): Observable<TerapiaDoDia[]> {
    const filtro = { data: this.data(), size: TAMANHO_DIA, sort: 'dataHoraInicio,asc' };
    const pagina: Observable<Pagina<TerapiaDoDia>> = this.minhas
      ? this.terapiaService.minhas(filtro)
      : this.terapiaService.listar(filtro);
    return pagina.pipe(map((p) => p.content));
  }

  carregar() {
    const atual = ++this.requisicao;
    this.carregando.set(true);
    this.erro.set('');

    this.buscarDoDia().subscribe({
      next: (lista) => {
        if (atual !== this.requisicao) return;
        this.terapias.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        if (atual !== this.requisicao) return;
        this.terapias.set([]);
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível carregar as terapias do dia.'));
      },
    });
  }

  mudarData(iso: string) {
    this.data.set(iso);
    this.carregar();
  }

  aplicarBusca(estado: EstadoBusca) {
    this.termoBusca.set(estado.termo);
  }

  aplicarFiltroAvancado(estado: EstadoFiltroAvancado) {
    this.situacoes.set(new Set(estado.status));
  }

  idPacienteSalvando(t: TerapiaDoDia): number | null {
    const s = this.salvando();
    return s && s.idTerapia === t.idTerapia ? s.idPaciente : null;
  }

  registrar(t: TerapiaDoDia, marcada: PresencaMarcada) {
    this.erro.set('');
    this.salvando.set({ idTerapia: t.idTerapia, idPaciente: marcada.idPaciente });

    this.terapiaService
      .registrarPresenca(t.idTerapia, marcada.idPaciente, {
        presenca: marcada.presenca,
        justificativa: marcada.justificativa,
      })
      .subscribe({
        next: (atualizada) => {
          this.terapias.update((lista) => substituirTerapia(lista, atualizada));
          this.salvando.set(null);
        },
        error: (err) => {
          this.salvando.set(null);
          this.erro.set(mensagemDeErro(err, 'Não foi possível registrar a presença.'));
        },
      });
  }
}
