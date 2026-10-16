import { CampoDetalhe } from '../../../../shared/components/campo-detalhe/campo-detalhe';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Especialidade, EspecialidadeDetalhe } from '../../../../core/models/especialidade.model';
import { EspecialidadeService } from '../../../../core/services/especialidade';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';
import { Auth } from '../../../../core/auth/auth';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { DialogEspecialidade } from '../dialog-especialidade/dialog-especialidade';

// GET /especialidades/{id}: especialistas e PJ vinculados (ativos e inativos).
@Component({
  selector: 'app-detalhe-especialidade',
  imports: [CampoDetalhe, RouterLink, CabecalhoPagina, ConfirmDialog, DialogEspecialidade],
  templateUrl: './detalhe-especialidade.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class DetalheEspecialidade implements OnInit {
  private especialidadeService = inject(EspecialidadeService);
  private avisoSucesso = inject(AvisoSucessoService);
  private router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly podeVerProfissionais = inject(Auth).temPermissao('VISUALIZAR_PROFISSIONAIS');

  especialidade = signal<EspecialidadeDetalhe | null>(null);
  carregando = signal(true);
  erro = signal('');
  erroAcao = signal('');

  edicaoAberta = signal(false);
  exclusaoAberta = signal(false);
  excluindo = signal(false);

  // A API só exclui especialidade sem especialistas (inativos também contam).
  podeExcluir = computed(() => this.especialidade()?.especialistas.length === 0);
  mensagemExclusao = computed(() => `A especialidade "${this.especialidade()?.nome ?? ''}" será excluída definitivamente.`);

  ngOnInit() {
    this.especialidadeService.buscar(this.id).subscribe({
      next: (e) => {
        this.especialidade.set(e);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(
          err?.status === 404 ? 'Especialidade não encontrada.' : mensagemDeErro(err, 'Não foi possível carregar a especialidade.')
        );
      },
    });
  }

  // O PATCH devolve os detalhes completos.
  aoSalvar(e: Especialidade) {
    this.edicaoAberta.set(false);
    this.especialidade.set(e as EspecialidadeDetalhe);
  }

  excluir() {
    this.exclusaoAberta.set(false);
    this.excluindo.set(true);
    this.erroAcao.set('');
    this.especialidadeService.excluir(this.id).subscribe({
      next: () => {
        this.avisoSucesso.mostrar({ titulo: 'Especialidade excluída', detalhe: this.especialidade()?.nome });
        this.router.navigateByUrl('/especialidades');
      },
      error: (err) => {
        this.excluindo.set(false);
        this.erroAcao.set(mensagemDeErro(err, 'Não foi possível excluir a especialidade.'));
      },
    });
  }
}
