import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { PacienteService } from '../../../core/services/paciente';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { OpcaoSelectBusca, SelectBusca } from '../../../shared/components/select-busca/select-busca';
import { Mascara } from '../../../shared/directives/mascara.directive';
import { DadosFolhaDocumento, FolhaDocumento } from '../../../shared/documentos/folha-documento/folha-documento';
import { imprimirDocumento } from '../../../shared/documentos/impressao';
import { INSTITUICAO, localEDataDeHoje } from '../../../shared/documentos/instituicao';
import { dataCurta } from '../../../shared/utils/data.util';
import { formatarCpf } from '../../../shared/utils/formatacao.util';
import { soDigitos } from '../../../shared/utils/texto.util';

// Declaração de recusa da APAE (a instituição informa que não pode atender a pessoa).
// Recepção e administrador. Quem é recusado normalmente não é paciente: os dados são digitados,
// com a opção de preencher a partir de um paciente cadastrado. Nada é salvo na API.
@Component({
  selector: 'app-emitir-recusa',
  imports: [FormsModule, Mascara, CabecalhoPagina, SelectBusca, FolhaDocumento],
  templateUrl: './emitir-recusa.html',
  styleUrl: './emitir-recusa.scss',
})
export class EmitirRecusa implements OnInit {
  private pacienteService = inject(PacienteService);
  private auth = inject(Auth);

  // Preencher a partir de um paciente cadastrado (opcional)
  opcoesPacientes = signal<OpcaoSelectBusca[]>([]);
  idPaciente = signal<number | null>(null);
  carregandoPaciente = signal(false);

  // Formulário
  nome = '';
  cpf = '';
  dataNascimento = '';
  motivo = '';
  erros = signal<Record<string, string>>({});
  erro = signal('');

  previa = signal(false);
  folha = computed<DadosFolhaDocumento | null>(() => (this.previa() ? this.montarFolha() : null));

  ngOnInit() {
    this.pacienteService.listar({ size: 1000, sort: 'nome,asc' }).subscribe({
      next: ({ content }) =>
        this.opcoesPacientes.set(
          content.map((p) => ({ id: p.idCadastro, label: `${p.nome} · CPF ${formatarCpf(p.cpf)}`, rotuloSelecionado: p.nome }))
        ),
      // A busca é só um atalho: sem ela, os dados continuam podendo ser digitados.
      error: () => this.opcoesPacientes.set([]),
    });
  }

  preencherComPaciente(id: number | string | null) {
    this.idPaciente.set(id as number | null);
    if (id === null) return;
    this.carregandoPaciente.set(true);
    this.pacienteService.buscar(id as number).subscribe({
      next: (p) => {
        this.nome = p.pessoa.nome;
        this.cpf = formatarCpf(p.pessoa.cpf);
        this.dataNascimento = p.pessoa.dataNascimento;
        this.erros.set({});
        this.carregandoPaciente.set(false);
      },
      error: (err) => {
        this.carregandoPaciente.set(false);
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
    if (!this.motivo.trim()) erros['motivo'] = 'Escreva o motivo da recusa.';
    this.erros.set(erros);
    if (Object.keys(erros).length) return;
    this.previa.set(true);
  }

  imprimir() {
    imprimirDocumento();
  }

  novaRecusa() {
    this.previa.set(false);
    this.idPaciente.set(null);
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
