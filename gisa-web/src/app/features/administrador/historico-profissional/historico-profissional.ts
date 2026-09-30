import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';

export interface EventoHistorico {
  data: string;
  titulo: string;
  descricao: string;
}

@Component({
  selector: 'app-historico-profissional',
  imports: [CabecalhoPagina],
  templateUrl: './historico-profissional.html',
  styleUrl: './historico-profissional.scss',
})
export class HistoricoProfissional implements OnInit {
  private route = inject(ActivatedRoute);

  id: string = this.route.snapshot.paramMap.get('id') ?? '';
  carregando = signal(true);
  eventos = signal<EventoHistorico[]>([]);

  ngOnInit() {
    // TODO: trocar por chamada real ao service, usando this.id (ex: GET /profissionais/:id/historico)
    setTimeout(() => {
      this.eventos.set([
        { data: '2026-08-12', titulo: 'Cadastro criado', descricao: 'Profissional cadastrado no sistema.' },
        { data: '2026-09-03', titulo: 'Dados atualizados', descricao: 'Telefone e endereço alterados.' },
        { data: '2026-09-20', titulo: 'Status alterado', descricao: 'Status alterado para Ativo.' },
      ]);
      this.carregando.set(false);
    }, 300);
  }
}