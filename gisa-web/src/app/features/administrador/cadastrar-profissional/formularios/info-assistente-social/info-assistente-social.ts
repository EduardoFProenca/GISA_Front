import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';
import { SelectBusca, OpcaoSelectBusca } from '../../../../../shared/components/select-busca/select-busca';
import { buscaPacientes, DICA_BUSCA_PACIENTE } from '../../../../../shared/components/select-busca/buscas';
import { PacienteService } from '../../../../../core/services/paciente';
import { Filtro } from '../../../../../shared/directives/filtro.directive';

// Paciente escolhido para vincular (só o que a busca mostra: o CPF vem mascarado).
export interface PacienteEscolhido {
  idCadastro: number;
  rotulo: string;
}

export interface InfoAssistenteSocialValor {
  ehAssistenteSocial: boolean;
  registroConselho: string;
}

// Assistente social: registro no CRESS e os pacientes já vinculados no cadastro. Na edição só aparece
// o registro (somente leitura); os vínculos passam a ser geridos no detalhe do profissional.
// Eager: os erros (ComErros) chegam depois da resposta da API e precisam aparecer.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-info-assistente-social',
  imports: [FormsModule, SelectBusca, Filtro],
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
  selecao: number | null = null;

  get idsPacientes(): number[] {
    return this.pacientes.map((p) => p.idCadastro);
  }

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
  }

  adicionarPaciente(opcao: OpcaoSelectBusca) {
    const idNum = Number(opcao.id);
    if (!this.pacientes.some((p) => p.idCadastro === idNum)) {
      this.pacientes = [...this.pacientes, { idCadastro: idNum, rotulo: opcao.label }];
    }
    this.limparErro('pacientes');
    // Zera o campo no próximo ciclo (o select acabou de emitir a escolha).
    this.selecao = idNum;
    setTimeout(() => (this.selecao = null));
  }

  removerPaciente(id: number) {
    this.pacientes = this.pacientes.filter((p) => p.idCadastro !== id);
  }
}
