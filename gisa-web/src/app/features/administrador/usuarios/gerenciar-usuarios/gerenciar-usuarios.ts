import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Subject, catchError, of, switchMap, tap, timer } from 'rxjs';
import { ICONES } from '../../../../shared/icons';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../../shared/components/paginacao/paginacao';
import { FiltroUsuarios, TipoCadastro, UsuarioResumo } from '../../../../core/models/auth.model';
import { Pagina, StatusCadastro } from '../../../../core/models/comum.model';
import { Perfil } from '../../../../core/models/perfil.model';
import { UsuarioService } from '../../../../core/services/usuario';
import { PerfilService } from '../../../../core/services/perfil';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { ROTULO_TIPO_CADASTRO } from '../../../../shared/utils/rotulos.util';
import { formatarCpf } from '../../../../shared/utils/formatacao.util';
import { soDigitos } from '../../../../shared/utils/texto.util';

const PAGINA_VAZIA: Pagina<UsuarioResumo> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 9 };

// GET /usuarios: só quem tem usuário de acesso (ativos e inativos), 9 por página.
@Component({
  selector: 'app-gerenciar-usuarios',
  imports: [NgIcon, FormsModule, RouterLink, CabecalhoPagina, Paginacao],
  templateUrl: './gerenciar-usuarios.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class GerenciarUsuarios implements OnInit {
  readonly icones = ICONES;
  private usuarioService = inject(UsuarioService);
  private perfilService = inject(PerfilService);

  readonly cpf = formatarCpf;
  readonly rotuloTipo = ROTULO_TIPO_CADASTRO;
  readonly tipos = Object.keys(ROTULO_TIPO_CADASTRO) as TipoCadastro[];
  readonly itensPorPagina = 9;

  // Filtros ('' = todos)
  termo = '';
  idPerfil = '';
  tipo: TipoCadastro | '' = '';
  status: StatusCadastro | '' = '';
  paginaAtual = signal(1);

  perfis = signal<Perfil[]>([]);
  pagina = signal<Pagina<UsuarioResumo>>(PAGINA_VAZIA);
  carregando = signal(true);
  erro = signal('');

  // A digitação espera 300 ms; selects e paginação carregam na hora.
  private busca$ = new Subject<{ atraso: number }>();

  constructor() {
    this.busca$
      .pipe(
        // switchMap descarta o timer anterior: só a última digitação dispara a busca.
        switchMap(({ atraso }) => timer(atraso)),
        tap(() => {
          this.carregando.set(true);
          this.erro.set('');
        }),
        switchMap(() =>
          this.usuarioService.listar(this.filtro()).pipe(
            catchError((err) => {
              this.erro.set(mensagemDeErro(err, 'Não foi possível carregar os usuários.'));
              return of(PAGINA_VAZIA);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((p) => {
        this.pagina.set(p);
        this.carregando.set(false);
      });
  }

  ngOnInit() {
    this.perfilService.listar().subscribe({ next: (p) => this.perfis.set(p), error: () => undefined });
    this.busca$.next({ atraso: 0 });
  }

  // Termo só com números (e máscara) busca por CPF; o resto busca por nome.
  private filtro(): FiltroUsuarios {
    const t = this.termo.trim();
    const ehCpf = !!t && /^[\d.\-\s]+$/.test(t);
    return {
      page: this.paginaAtual() - 1,
      size: this.itensPorPagina,
      cpf: ehCpf ? soDigitos(t) : undefined,
      nome: ehCpf ? undefined : t || undefined,
      idPerfil: this.idPerfil ? Number(this.idPerfil) : undefined,
      tipoCadastro: this.tipo ? [this.tipo] : undefined,
      statusCadastro: this.status || undefined,
    };
  }

  aoDigitar() {
    this.paginaAtual.set(1);
    this.busca$.next({ atraso: 300 });
  }

  aoFiltrar() {
    this.paginaAtual.set(1);
    this.busca$.next({ atraso: 0 });
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
    this.busca$.next({ atraso: 0 });
  }
}
