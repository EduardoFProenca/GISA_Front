import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Paciente } from '../../../core/models/paciente.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { EspecialistaLogadoService, PerfilEspecialista } from '../../../core/services/especialista-logado';
import { DadosFolhaDocumento, FolhaDocumento } from '../../../shared/documentos/folha-documento/folha-documento';
import { imprimirDocumento } from '../../../shared/documentos/impressao';
import { localEDataDeHoje } from '../../../shared/documentos/instituicao';
import { dataCurta, idadeEmAnos } from '../../../shared/utils/data.util';
import { formatarCpf } from '../../../shared/utils/formatacao.util';
import { formatarMatricula } from '../agenda/agenda.util';
import { MODELOS_ATESTADO, ModeloTexto, TITULO_DOCUMENTO, TipoDocumentoClinico } from './documento-clinico.util';

// Emissão de atestado ou receita em drawer lateral (prontuário e telas "Emitir Atestado/Receita").
// O especialista escreve o texto livremente; no atestado pode partir de um modelo.
// A API NÃO guarda esses documentos: a folha é montada aqui e impressa / salva em PDF pelo navegador.
@Component({
  selector: 'app-documento-clinico-drawer',
  imports: [FormsModule, FolhaDocumento],
  templateUrl: './documento-clinico-drawer.html',
  styleUrl: './documento-clinico-drawer.scss',
})
export class DocumentoClinicoDrawer {
  private perfilService = inject(EspecialistaLogadoService);

  private _aberto = false;

  @Input() set aberto(valor: boolean) {
    if (valor && !this._aberto) this.aoAbrir();
    this._aberto = valor;
  }
  get aberto(): boolean {
    return this._aberto;
  }

  @Input({ required: true }) paciente!: Paciente;
  @Input({ required: true }) tipo!: TipoDocumentoClinico;
  @Output() fechar = new EventEmitter<void>();

  readonly cpf = formatarCpf;
  readonly dataCurta = dataCurta;
  readonly matricula = formatarMatricula;

  texto = '';
  erroTexto = signal('');
  perfil = signal<PerfilEspecialista | null>(null);
  erroPerfil = signal('');
  previa = signal(false);

  get titulo(): string {
    return TITULO_DOCUMENTO[this.tipo];
  }

  get modelos(): ModeloTexto[] {
    return this.tipo === 'ATESTADO' ? MODELOS_ATESTADO : [];
  }

  get idade(): string {
    return `${idadeEmAnos(this.paciente.pessoa.dataNascimento)} anos`;
  }

  folha = computed<DadosFolhaDocumento | null>(() => {
    const perfil = this.perfil();
    if (!this.previa() || !perfil) return null;
    return this.montarFolha(perfil);
  });

  private aoAbrir() {
    this.texto = '';
    this.erroTexto.set('');
    this.previa.set(false);
    this.erroPerfil.set('');
    // Assinatura: nome, especialidade, registro no conselho e CBO do especialista logado.
    this.perfilService.perfil().subscribe({
      next: (p) => this.perfil.set(p),
      error: (err) => this.erroPerfil.set(mensagemDeErro(err, 'Não foi possível carregar os dados do emitente.')),
    });
  }

  // Modelo substitui o texto atual (pede confirmação se já houver algo digitado).
  aplicarModelo(modelo: ModeloTexto) {
    if (this.texto.trim() && !confirm('Substituir o texto atual pelo modelo?')) return;
    this.texto = modelo.texto({
      pacienteNome: this.paciente.pessoa.nome,
      pacienteCpf: this.paciente.pessoa.cpf,
      responsavelNome: this.paciente.responsaveis[0]?.responsavel.nome ?? null,
    });
    this.erroTexto.set('');
  }

  gerarPrevia() {
    if (!this.texto.trim()) {
      this.erroTexto.set(`Escreva o texto ${this.tipo === 'ATESTADO' ? 'do atestado' : 'da receita'}.`);
      return;
    }
    this.previa.set(true);
  }

  fecharPrevia() {
    this.previa.set(false);
  }

  // O navegador oferece "Salvar como PDF" na janela de impressão.
  imprimir() {
    imprimirDocumento();
  }

  aoFechar() {
    this.previa.set(false);
    this.fechar.emit();
  }

  private montarFolha(perfil: PerfilEspecialista): DadosFolhaDocumento {
    const p = this.paciente.pessoa;
    const registro = [perfil.registroConselho, perfil.cbo ? `CBO ${perfil.cbo}` : ''].filter(Boolean).join(' · ');
    return {
      titulo: this.titulo,
      identificacao: [
        { rotulo: 'Paciente', valor: p.nome },
        { rotulo: 'CPF', valor: formatarCpf(p.cpf) },
        { rotulo: 'Nascimento', valor: `${dataCurta(p.dataNascimento)} (${this.idade})` },
      ],
      texto: this.texto.trim(),
      localData: localEDataDeHoje(),
      assinaturas: [
        {
          nome: perfil.nome,
          detalhes: [perfil.especialidades.join(', '), registro].filter(Boolean),
        },
      ],
    };
  }
}
