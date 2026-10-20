import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { PacienteService } from '../../../core/services/paciente';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { SelectBusca } from '../../../shared/components/select-busca/select-busca';
import { buscaPacientes, DICA_BUSCA_PACIENTE } from '../../../shared/components/select-busca/buscas';
import { Mascara } from '../../../shared/directives/mascara.directive';
import { DadosFolhaDocumento, FolhaDocumento } from '../../../shared/documentos/folha-documento/folha-documento';
import { imprimirDocumento } from '../../../shared/documentos/impressao';
import { INSTITUICAO, localEDataDeHoje } from '../../../shared/documentos/instituicao';
import { dataCurta, dataFutura, hojeIso } from '../../../shared/utils/data.util';
import { formatarCpf } from '../../../shared/utils/formatacao.util';
import { cpfValido, soDigitos } from '../../../shared/utils/texto.util';
import { resumoInativacaoPaciente } from '../../../shared/utils/rotulos.util';
import { Filtro } from '../../../shared/directives/filtro.directive';

// Declaração de recusa da APAE (a instituição informa que não pode atender a pessoa).
// Recepção e administrador. Quem é recusado normalmente não é paciente: os dados são digitados,
// com a opção de preencher a partir de um paciente cadastrado. Nada é salvo na API.
@Component({
  selector: 'app-emitir-recusa',
  imports: [FormsModule, Mascara, CabecalhoPagina, SelectBusca, FolhaDocumento, ConfirmDialog, Filtro],
  templateUrl: './emitir-recusa.html',
  styleUrl: './emitir-recusa.scss',
})
export class EmitirRecusa {
  private pacienteService = inject(PacienteService);
  private auth = inject(Auth);
  private avisoSucesso = inject(AvisoSucessoService);

  // Preencher a partir de um paciente cadastrado (opcional)
  readonly buscarPacientes = buscaPacientes(this.pacienteService);
  readonly dicaBuscaPaciente = DICA_BUSCA_PACIENTE;
  idPaciente = signal<number | null>(null);

  // Recusa de um paciente cadastrado e ativo: depois de imprimir, oferece inativá-lo (uma vez por emissão).
  private podeInativar = this.auth.temPermissao('INATIVAR_PACIENTE');
  private pacienteAtivo = signal(false);
  private inativacaoOferecida = false;
  confirmarInativacaoAberta = signal(false);

  // Formulário
  nome = '';
  cpf = '';
  dataNascimento = '';
  readonly hoje = hojeIso();
  motivo = '';
  erros = signal<Record<string, string>>({});
  erro = signal('');

  previa = signal(false);
  folha = computed<DadosFolhaDocumento | null>(() => (this.previa() ? this.montarFolha() : null));

  preencherComPaciente(id: number | string | null) {
    this.idPaciente.set(id as number | null);
    this.pacienteAtivo.set(false);
    this.inativacaoOferecida = false;
    if (id === null) return;
    this.pacienteService.buscar(id as number).subscribe({
      next: (p) => {
        this.nome = p.pessoa.nome;
        this.cpf = formatarCpf(p.pessoa.cpf);
        this.dataNascimento = p.pessoa.dataNascimento;
        this.pacienteAtivo.set(p.pessoa.statusCadastro === 'ATIVO');
        this.erros.set({});
      },
      error: (err) => {
        this.erro.set(mensagemDeErro(err, 'Não foi possível carregar o paciente.'));
      },
    });
  }

  limparErro(campo: string) {
    this.erros.update((e) => {
      const { [campo]: _, ...resto } = e;
      return resto;
    });
  }

  visualizar() {
    const erros: Record<string, string> = {};
    if (!this.nome.trim()) erros['nome'] = 'Informe o nome da pessoa.';
    const cpf = soDigitos(this.cpf);
    if (cpf && cpf.length !== 11) erros['cpf'] = 'O CPF deve ter 11 dígitos.';
    else if (cpf && !cpfValido(cpf)) erros['cpf'] = 'CPF inválido.';
    if (dataFutura(this.dataNascimento)) erros['nascimento'] = 'A data de nascimento não pode ser no futuro.';
    if (!this.motivo.trim()) erros['motivo'] = 'Escreva o motivo da recusa.';
    this.erros.set(erros);
    if (Object.keys(erros).length) return;
    this.previa.set(true);
  }

  imprimir() {
    imprimirDocumento();
    if (this.idPaciente() !== null && this.pacienteAtivo() && this.podeInativar && !this.inativacaoOferecida) {
      this.inativacaoOferecida = true;
      this.confirmarInativacaoAberta.set(true);
    }
  }

  inativarPaciente() {
    const id = this.idPaciente();
    this.confirmarInativacaoAberta.set(false);
    if (id === null) return;
    this.pacienteService.inativar(id).subscribe({
      next: (resumo) => {
        this.pacienteAtivo.set(false);
        const terapias = resumoInativacaoPaciente(resumo);
        this.avisoSucesso.mostrar({
          titulo: 'Paciente inativado',
          detalhe: terapias ? `${this.nome.trim()}: ${terapias}` : this.nome.trim(),
        });
      },
      error: (err) => {
        this.previa.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível inativar o paciente.'));
      },
    });
  }

  novaRecusa() {
    this.previa.set(false);
    this.idPaciente.set(null);
    this.pacienteAtivo.set(false);
    this.inativacaoOferecida = false;
    this.nome = '';
    this.cpf = '';
    this.dataNascimento = '';
    this.motivo = '';
    this.erros.set({});
    this.erro.set('');
  }

  private montarFolha(): DadosFolhaDocumento {
    const nome = this.nome.trim();
    const identificacao = [{ rotulo: 'Nome', valor: nome }];
    if (soDigitos(this.cpf)) identificacao.push({ rotulo: 'CPF', valor: formatarCpf(this.cpf) });
    if (this.dataNascimento) identificacao.push({ rotulo: 'Nascimento', valor: dataCurta(this.dataNascimento) });

    const usuario = this.auth.usuarioAtual();
    return {
      titulo: 'Declaração de Recusa',
      identificacao,
      texto:
        `A ${INSTITUICAO.nome} declara, para os devidos fins, que não é possível realizar o atendimento de ${nome} ` +
        `nesta instituição, pelo motivo descrito a seguir:\n\n${this.motivo.trim()}`,
      localData: localEDataDeHoje(),
      assinaturas: [
        {
          nome: usuario?.nome ?? '',
          detalhes: [usuario?.perfil.nome ?? '', INSTITUICAO.nome].filter(Boolean),
        },
      ],
    };
  }
}
