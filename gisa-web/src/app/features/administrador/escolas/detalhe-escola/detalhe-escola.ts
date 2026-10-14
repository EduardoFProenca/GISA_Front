import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Paginacao } from '../../../../shared/components/paginacao/paginacao';
import { Escola, EscolaDetalhe } from '../../../../core/models/escola.model';
import { PacienteResumo } from '../../../../core/models/paciente.model';
import { EscolaService } from '../../../../core/services/escola';
import { PacienteService } from '../../../../core/services/paciente';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';
import { Auth } from '../../../../core/auth/auth';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { ROTULO_STATUS_PACIENTE, ROTULO_TIPO_ESCOLA } from '../../../../shared/utils/rotulos.util';
import { formatarCelular, formatarCpf } from '../../../../shared/utils/formatacao.util';
import { DialogEscola } from '../dialog-escola/dialog-escola';

// GET /escolas/{id} + pacientes da escola (GET /pacientes?idEscola=, exige VISUALIZAR_PACIENTES).
@Component({
  selector: 'app-detalhe-escola',
  imports: [RouterLink, CabecalhoPagina, ConfirmDialog, Paginacao, DialogEscola],
  templateUrl: './detalhe-escola.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class DetalheEscola implements OnInit {
  private escolaService = inject(EscolaService);
  private pacienteService = inject(PacienteService);
  private avisoSucesso = inject(AvisoSucessoService);
  private router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly rotuloTipo = ROTULO_TIPO_ESCOLA;
  readonly rotuloStatus = ROTULO_STATUS_PACIENTE;
  readonly telefone = formatarCelular;
  readonly cpf = formatarCpf;
  readonly podeVerPacientes = inject(Auth).temPermissao('VISUALIZAR_PACIENTES');
  readonly itensPorPagina = 9;

  escola = signal<EscolaDetalhe | null>(null);
  carregando = signal(true);
  erro = signal('');
  erroAcao = signal('');

  pacientes = signal<PacienteResumo[]>([]);
  totalPacientes = signal(0);
  paginaPacientes = signal(1);
  carregandoPacientes = signal(false);
  erroPacientes = signal('');

  edicaoAberta = signal(false);
  exclusaoAberta = signal(false);
  excluindo = signal(false);

  // A API só exclui escola sem pacientes (inativos também contam).
  podeExcluir = computed(() => this.escola()?.quantidadePacientes === 0);
  mensagemExclusao = computed(() => `A escola "${this.escola()?.nome ?? ''}" será excluída definitivamente.`);

  ngOnInit() {
    this.escolaService.buscar(this.id).subscribe({
      next: (e) => {
        this.escola.set(e);
        this.carregando.set(false);
        if (e.quantidadePacientes && this.podeVerPacientes) this.carregarPacientes();
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.status === 404 ? 'Escola não encontrada.' : mensagemDeErro(err, 'Não foi possível carregar a escola.'));
      },
    });
  }

  private carregarPacientes() {
    this.carregandoPacientes.set(true);
    this.erroPacientes.set('');
    this.pacienteService
      .listar({ idEscola: this.id, page: this.paginaPacientes() - 1, size: this.itensPorPagina, sort: 'nome,asc' })
      .subscribe({
        next: (p) => {
          this.pacientes.set(p.content);
          this.totalPacientes.set(p.totalElements);
          this.carregandoPacientes.set(false);
        },
        error: (err) => {
          this.carregandoPacientes.set(false);
          this.erroPacientes.set(mensagemDeErro(err, 'Não foi possível carregar os pacientes.'));
        },
      });
  }

  mudarPaginaPacientes(pagina: number) {
    this.paginaPacientes.set(pagina);
    this.carregarPacientes();
  }

  // O PATCH devolve os detalhes completos.
  aoSalvar(e: Escola) {
    this.edicaoAberta.set(false);
    this.escola.set(e as EscolaDetalhe);
  }

  excluir() {
    this.exclusaoAberta.set(false);
    this.excluindo.set(true);
    this.erroAcao.set('');
    this.escolaService.excluir(this.id).subscribe({
      next: () => {
        this.avisoSucesso.mostrar({ titulo: 'Escola excluída', detalhe: this.escola()?.nome });
        this.router.navigateByUrl('/administrador/escolas');
      },
      error: (err) => {
        this.excluindo.set(false);
        this.erroAcao.set(mensagemDeErro(err, 'Não foi possível excluir a escola.'));
      },
    });
  }
}
