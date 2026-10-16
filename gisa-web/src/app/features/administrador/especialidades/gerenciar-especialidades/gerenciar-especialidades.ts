import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ICONES } from '../../../../shared/icons';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Especialidade } from '../../../../core/models/especialidade.model';
import { EspecialidadeService } from '../../../../core/services/especialidade';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { normalizarBusca } from '../../../../shared/utils/texto.util';
import { DialogEspecialidade } from '../dialog-especialidade/dialog-especialidade';

// GET /especialidades (sem paginação, por nome). A busca filtra na própria tela.
@Component({
  selector: 'app-gerenciar-especialidades',
  imports: [NgIcon, FormsModule, RouterLink, CabecalhoPagina, DialogEspecialidade],
  templateUrl: './gerenciar-especialidades.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class GerenciarEspecialidades implements OnInit {
  readonly icones = ICONES;
  private especialidadeService = inject(EspecialidadeService);
  private router = inject(Router);

  termo = signal('');
  especialidades = signal<Especialidade[]>([]);
  carregando = signal(true);
  erro = signal('');
  dialogAberto = signal(false);

  filtradas = computed(() => {
    const t = normalizarBusca(this.termo().trim());
    return t ? this.especialidades().filter((e) => normalizarBusca(e.nome).includes(t)) : this.especialidades();
  });

  ngOnInit() {
    this.especialidadeService.listar().subscribe({
      next: (lista) => {
        this.especialidades.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível carregar as especialidades.'));
      },
    });
  }

  aoSalvar(e: Especialidade) {
    this.dialogAberto.set(false);
    this.router.navigate(['/especialidades', e.idEspecialidade]);
  }
}
