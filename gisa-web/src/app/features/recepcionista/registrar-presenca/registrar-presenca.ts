import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { BuscaFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import {
  EstadoFiltroAvancado,
  FiltroAvancado,
  OpcaoFiltroAvancado,
} from '../../../shared/components/filtro-avancado/filtro-avancado';
import { NavegadorData } from '../../../shared/components/navegador-data/navegador-data';
import { hojeIso } from '../../../shared/utils/data.util';
import { PresencaService } from '../../../services/presenca';
import { ConsultaDiaria } from '../../../core/models/consulta-diaria.model';
import { ResumoPresencaDia } from './componentes/resumo-presenca-dia/resumo-presenca-dia';
import {
  CardConsultaPresenca,
  PresencaMarcada,
} from './componentes/card-consulta-presenca/card-consulta-presenca';
import {
  atualizarPaciente,
  calcularResumo,
  filtrarConsultas,
  filtrarPorSituacao,
} from './presenca.util';

@Component({
  selector: 'app-registrar-presenca',
  imports: [
    CabecalhoPagina,
    BuscaFiltro,
    FiltroAvancado,
    NavegadorData,
    ResumoPresencaDia,
    CardConsultaPresenca,
  ],
  templateUrl: './registrar-presenca.html',
  styleUrl: './registrar-presenca.scss',
})
export class RegistrarPresenca implements OnInit {
  private presencaService = inject(PresencaService);

  data = signal(hojeIso());
  consultas = signal<ConsultaDiaria[]>([]);
  carregando = signal(true);
  erro = signal('');
  termoBusca = signal('');
  situacoes = signal<ReadonlySet<string>>(new Set());
  salvando = signal<{ idTerapia: number; idPaciente: number } | null>(null);

  // O período é escolhido no navegador de data, então o filtro avançado só tem situação.
  situacoesDisponiveis: OpcaoFiltroAvancado[] = [
    { valor: 'PENDENTE', label: 'Pendentes', cor: '#2563eb' },
    { valor: 'LIBERADA', label: 'Compareceu', cor: '#16a34a' },
    { valor: 'CANCELADA', label: 'Falta', cor: '#ef4444' },
    //{ valor: 'CANCELADAjustificada', label: 'Falta justificada', cor: '#b38d25' },
  ];

  resumo = computed(() => calcularResumo(this.consultas()));
  consultasFiltradas = computed(() =>
    filtrarPorSituacao(filtrarConsultas(this.consultas(), this.termoBusca()), this.situacoes())
  );

  // Evita que uma resposta antiga sobrescreva a de uma data escolhida depois.
  private requisicao = 0;

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    const atual = ++this.requisicao;
    this.carregando.set(true);
    this.erro.set('');

    this.presencaService.listarDoDia(this.data()).subscribe({
      next: (lista) => {
        if (atual !== this.requisicao) return;
        this.consultas.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        if (atual !== this.requisicao) return;
        this.consultas.set([]);
        this.carregando.set(false);
        this.erro.set(err?.error?.message || 'Não foi possível carregar as consultas do dia.');
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

  idPacienteSalvando(c: ConsultaDiaria): number | null {
    const s = this.salvando();
    return s && s.idTerapia === c.idTerapia ? s.idPaciente : null;
  }

  registrar(c: ConsultaDiaria, marcada: PresencaMarcada) {
    this.erro.set('');
    this.salvando.set({ idTerapia: c.idTerapia, idPaciente: marcada.idPaciente });

    this.presencaService
      .registrar(c.idTerapia, marcada.idPaciente, {
        presenca: marcada.presenca,
        justificativa: marcada.justificativa,
      })
      .subscribe({
        next: (atualizado) => {
          this.consultas.update((lista) => atualizarPaciente(lista, c.idTerapia, atualizado));
          this.salvando.set(null);
        },
        error: (err) => {
          this.salvando.set(null);
          this.erro.set(err?.error?.message || 'Não foi possível registrar a presença.');
        },
      });
  }
}