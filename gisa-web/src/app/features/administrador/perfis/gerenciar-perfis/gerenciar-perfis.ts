import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Perfil, PerfilDetalhe, Permissao } from '../../../../core/models/perfil.model';
import { PerfilService } from '../../../../core/services/perfil';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { DialogPerfil } from '../dialog-perfil/dialog-perfil';

// GET /perfis (sem paginação, ordenado por nome).
@Component({
  selector: 'app-gerenciar-perfis',
  imports: [RouterLink, CabecalhoPagina, DialogPerfil],
  templateUrl: './gerenciar-perfis.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class GerenciarPerfis implements OnInit {
  private perfilService = inject(PerfilService);
  private router = inject(Router);

  perfis = signal<Perfil[]>([]);
  permissoes = signal<Permissao[]>([]);
  carregando = signal(true);
  erro = signal('');
  dialogAberto = signal(false);

  ngOnInit() {
    this.perfilService.listar().subscribe({
      next: (lista) => {
        this.perfis.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível carregar os perfis.'));
      },
    });
    // Opções do diálogo "Novo perfil".
    this.perfilService.listarPermissoes().subscribe({ next: (lista) => this.permissoes.set(lista) });
  }

  plural(n: number, singular: string, plural: string): string {
    return `${n} ${n === 1 ? singular : plural}`;
  }

  aoSalvar(perfil: PerfilDetalhe) {
    this.dialogAberto.set(false);
    this.router.navigate(['/administrador/perfis', perfil.idPerfil]);
  }
}
