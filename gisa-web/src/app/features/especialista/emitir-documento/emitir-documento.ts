import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Paciente } from '../../../core/models/paciente.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { PacienteService } from '../../../core/services/paciente';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { OpcaoSelectBusca, SelectBusca } from '../../../shared/components/select-busca/select-busca';
import { formatarCpf } from '../../../shared/utils/formatacao.util';
import { DocumentoClinicoDrawer } from '../documento-clinico/documento-clinico-drawer';
import { TITULO_DOCUMENTO, TipoDocumentoClinico } from '../documento-clinico/documento-clinico.util';

// Telas "Emitir Atestado" e "Emitir Receita" (rota com data.tipo): escolhe o paciente e abre o
// mesmo drawer do prontuário.
@Component({
  selector: 'app-emitir-documento',
  imports: [CabecalhoPagina, SelectBusca, DocumentoClinicoDrawer],
  templateUrl: './emitir-documento.html',
  styleUrl: './emitir-documento.scss',
})
export class EmitirDocumento implements OnInit {
  private pacienteService = inject(PacienteService);
  readonly tipo = inject(ActivatedRoute).snapshot.data['tipo'] as TipoDocumentoClinico;
  readonly titulo = `Emitir ${TITULO_DOCUMENTO[this.tipo]}`;

  opcoes = signal<OpcaoSelectBusca[]>([]);
  idPaciente = signal<number | null>(null);
  paciente = signal<Paciente | null>(null);
  carregandoPaciente = signal(false);
  erro = signal('');
  drawerAberto = signal(false);

  ngOnInit() {
    this.pacienteService.listar({ size: 1000, sort: 'nome,asc' }).subscribe({
      next: ({ content }) =>
        this.opcoes.set(
          content.map((p) => ({ id: p.idCadastro, label: `${p.nome} · CPF ${formatarCpf(p.cpf)}`, rotuloSelecionado: p.nome }))
        ),
      error: (err) => this.erro.set(mensagemDeErro(err, 'Não foi possível carregar a lista de pacientes.')),
    });
  }

  // Ao escolher o paciente, carrega o cadastro completo e já abre o drawer.
  escolher(id: number | string | null) {
    this.idPaciente.set(id as number | null);
    this.paciente.set(null);
    this.erro.set('');
    if (id === null) return;

    this.carregandoPaciente.set(true);
    this.pacienteService.buscar(id as number).subscribe({
      next: (p) => {
        this.paciente.set(p);
        this.carregandoPaciente.set(false);
        this.drawerAberto.set(true);
      },
      error: (err) => {
        this.carregandoPaciente.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível carregar o paciente.'));
      },
    });
  }
}
