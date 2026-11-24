import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { ProfissionalService } from '../../../../core/services/profissional';
import { Botao } from '../../../../shared/components/botao/botao';
import { OpcaoSelectBusca, SelectBusca } from '../../../../shared/components/select-busca/select-busca';
import { buscaAssistentesSociais } from '../../../../shared/components/select-busca/buscas';

export interface AssistenteSocialVinculado {
  idCadastro: number;
  nome: string;
}

// Assistentes sociais do paciente na edição. Adicionar e remover só mudam a lista; quem grava é a tela,
// ao salvar (novos() e removidos() comparam com o que a API tem). Rotas do assistente social: EDITAR_PROFISSIONAL.
@Component({
  selector: 'app-assistentes-sociais-edicao',
  imports: [Botao, SelectBusca],
  templateUrl: './assistentes-sociais-edicao.html',
  styleUrl: './assistentes-sociais-edicao.scss',
})
export class AssistentesSociaisEdicao implements OnInit {
  // Lido só no ngOnInit.
  @Input() iniciais: AssistenteSocialVinculado[] = [];
  @Input() podeAlterar = false;

  readonly buscar = buscaAssistentesSociais(inject(ProfissionalService));

  lista = signal<AssistenteSocialVinculado[]>([]);
  // Valor do campo de busca: volta a vazio a cada assistente social adicionado.
  selecao = signal<number | null>(null);
  ids = computed(() => this.lista().map((a) => a.idCadastro));
  // Vinculados na API hoje.
  private salvos = new Set<number>();
  // Para as mensagens de falha (inclusive de quem foi removido).
  private nomes = new Map<number, string>();

  ngOnInit() {
    this.lista.set(this.iniciais.map((a) => ({ ...a })));
    this.salvos = new Set(this.iniciais.map((a) => a.idCadastro));
    for (const a of this.iniciais) this.nomes.set(a.idCadastro, a.nome);
  }

  adicionar(opcao: OpcaoSelectBusca) {
    const id = Number(opcao.id);
    const nome = opcao.rotuloSelecionado ?? opcao.label;
    if (!this.lista().some((a) => a.idCadastro === id)) {
      this.lista.update((l) => [...l, { idCadastro: id, nome }]);
    }
    this.nomes.set(id, nome);
    // Zera o campo no próximo ciclo (o select acabou de emitir a escolha), como no InfoAssistenteSocial.
    this.selecao.set(id);
    setTimeout(() => this.selecao.set(null));
  }

  remover(id: number) {
    this.lista.update((l) => l.filter((a) => a.idCadastro !== id));
  }

  // Ids da lista que ainda não estão vinculados na API.
  novos(): number[] {
    return this.ids().filter((id) => !this.salvos.has(id));
  }

  // Ids vinculados na API que saíram da lista.
  removidos(): number[] {
    const ids = new Set(this.ids());
    return [...this.salvos].filter((id) => !ids.has(id));
  }

  marcarSalvo(id: number, vinculado: boolean) {
    if (vinculado) this.salvos.add(id);
    else this.salvos.delete(id);
  }

  nome(id: number): string {
    return this.nomes.get(id) ?? `Assistente social ${id}`;
  }
}
