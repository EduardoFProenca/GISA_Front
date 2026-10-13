import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { FiltroAvancado, EstadoFiltroAvancado, OpcaoFiltroAvancado } from '../../../shared/components/filtro-avancado/filtro-avancado';
import { ProfissionalService, tipoDoDetalhe } from '../../../core/services/profissional';
import { TerapiaService } from '../../../core/services/terapia';
import { StatusTerapia, Terapia } from '../../../core/models/terapia.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { COR_STATUS_TERAPIA, ROTULO_STATUS_TERAPIA } from '../../../shared/utils/rotulos.util';
import { CardTerapia } from '../../terapias/componentes/card-terapia/card-terapia';

const STATUS: StatusTerapia[] = ['AGENDADA', 'EM_ATENDIMENTO', 'CONCLUIDA', 'CANCELADA'];

// Terapias de um especialista (GET /terapias?idEspecialista=), mais recentes primeiro.
@Component({
  selector: 'app-historico-profissional',
  imports: [CabecalhoPagina, Paginacao, FiltroAvancado, CardTerapia],
  templateUrl: './historico-profissional.html',
  styleUrl: './historico-profissional.scss',
})
export class HistoricoProfissional implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profissionalService = inject(ProfissionalService);
  private terapiaService = inject(TerapiaService);

  id = Number(this.route.snapshot.paramMap.get('id'));
  itensPorPagina = 9;

  statusDisponiveis: OpcaoFiltroAvancado[] = STATUS.map((s) => ({
    valor: s,
    label: ROTULO_STATUS_TERAPIA[s],
    cor: COR_STATUS_TERAPIA[s],
  }));

  nome = signal('');
  atendeTerapias = signal(true);
  carregando = signal(true);
  erro = signal('');
  terapias = signal<Terapia[]>([]);
  total = signal(0);
  pagina = signal(1);
  private status = signal<StatusTerapia[]>([]);

  ngOnInit() {
    this.profissionalService.buscarDetalhe(this.id).subscribe({
      next: (d) => {
        this.nome.set(d.profissional.pessoa.nome);
        // Profissional comum não participa de terapias.
        this.atendeTerapias.set(tipoDoDetalhe(d) !== 'PROFISSIONAL');
        if (this.atendeTerapias()) this.carregar();
        else this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(mensagemDeErro(err, 'Não foi possível carregar o profissional.'));
        this.carregando.set(false);
      },
    });
  }

  private carregar() {
    this.carregando.set(true);
    this.terapiaService
      .listar({
        idEspecialista: this.id,
        status: this.status(),
        page: this.pagina() - 1,
        size: this.itensPorPagina,
        sort: 'dataHoraInicio,desc',
      })
      .subscribe({
        next: (p) => {
          this.terapias.set(p.content);
          this.total.set(p.totalElements);
          this.carregando.set(false);
        },
        error: (err) => {
          this.erro.set(mensagemDeErro(err, 'Não foi possível carregar as terapias.'));
          this.carregando.set(false);
        },
      });
  }

  aplicarFiltro(estado: EstadoFiltroAvancado) {
    this.status.set([...estado.status] as StatusTerapia[]);
    this.pagina.set(1);
    this.carregar();
  }

  mudarPagina(p: number) {
    this.pagina.set(p);
    this.carregar();
  }

  verDetalhes(idTerapia: number) {
    this.router.navigate(['/administrador/terapias', idTerapia]);
  }
}
