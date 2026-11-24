import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';
import { SelectBusca, OpcaoSelectBusca } from '../../../../../shared/components/select-busca/select-busca';
import { buscaPacientes, DICA_BUSCA_PACIENTE } from '../../../../../shared/components/select-busca/buscas';
import { PacienteService } from '../../../../../core/services/paciente';
import { Filtro } from '../../../../../shared/directives/filtro.directive';
import { Botao } from '../../../../../shared/components/botao/botao';

// Paciente escolhido para vincular (só o que a busca mostra: o CPF vem mascarado).
export interface PacienteEscolhido {
  idCadastro: number;
  rotulo: string;
}

export interface InfoAssistenteSocialValor {
  ehAssistenteSocial: boolean;
  registroConselho: string;
  pacientes?: PacienteEscolhido[];
}

// Assistente social: registro no CRESS e os pacientes vinculados. No cadastro, os pacientes vão no POST; na edição, o registro é somente leitura e os vínculos são gravados pela tela ao salvar (novos() e removidos()).
// Eager: os erros (ComErros) chegam depois da resposta da API e precisam aparecer.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-info-assistente-social',
  imports: [Botao, FormsModule, SelectBusca, Filtro],
  templateUrl: './info-assistente-social.html',
  styleUrl: '../info-especialista/info-especialista.scss',
})
export class InfoAssistenteSocial extends ComErros implements OnInit, InfoAssistenteSocialValor {
  @Input() dadosIniciais?: Partial<InfoAssistenteSocialValor>;
  @Input() somenteLeitura: boolean = false;
  // Edição (o tipo e o registro não mudam) ou "é especialista" marcado (os dois tipos não se acumulam).
  @Input() bloquearTipo: boolean = false;
  // Edição: os vínculos ficam no detalhe do profissional.
  @Input() edicao: boolean = false;

  readonly buscarPacientes = buscaPacientes(inject(PacienteService));
  readonly dicaBuscaPaciente = DICA_BUSCA_PACIENTE;

  ehAssistenteSocial: boolean = false;
  registroConselho: string = '';
  pacientes: PacienteEscolhido[] = [];
  // Valor do campo de busca: volta a vazio a cada paciente adicionado.
  selecao = signal<number | null>(null);
  // Edição: pacientes vinculados na API hoje (o que a tela compara ao salvar).
  private salvos = new Set<number>();
  // Rótulos para as mensagens de falha (inclusive de quem foi removido da lista).
  private rotulos = new Map<number, string>();

  get idsPacientes(): number[] {
    return this.pacientes.map((p) => p.idCadastro);
  }

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
    for (const p of this.pacientes) this.rotulos.set(p.idCadastro, p.rotulo);
    if (this.edicao) this.salvos = new Set(this.pacientes.map((p) => p.idCadastro));
  }

  adicionarPaciente(opcao: OpcaoSelectBusca) {
    const idNum = Number(opcao.id);
    this.rotulos.set(idNum, opcao.label);
    if (!this.pacientes.some((p) => p.idCadastro === idNum)) {
      this.pacientes = [...this.pacientes, { idCadastro: idNum, rotulo: opcao.label }];
    }
    this.limparErro('pacientes');
    // Zera o campo no próximo ciclo (o select acabou de emitir a escolha). Signal: sem zone.js, só ele
    // agenda a nova checagem da tela.
    this.selecao.set(idNum);
    setTimeout(() => this.selecao.set(null));
  }

  removerPaciente(id: number) {
    this.pacientes = this.pacientes.filter((p) => p.idCadastro !== id);
  }

  // Edição: ids da lista que ainda não estão vinculados na API.
  novos(): number[] {
    return this.idsPacientes.filter((id) => !this.salvos.has(id));
  }

  // Edição: ids vinculados na API que saíram da lista.
  removidos(): number[] {
    const ids = new Set(this.idsPacientes);
    return [...this.salvos].filter((id) => !ids.has(id));
  }

  marcarSalvo(id: number, vinculado: boolean) {
    if (vinculado) this.salvos.add(id);
    else this.salvos.delete(id);
  }

  rotulo(id: number): string {
    return this.rotulos.get(id) ?? `Paciente ${id}`;
  }
}
