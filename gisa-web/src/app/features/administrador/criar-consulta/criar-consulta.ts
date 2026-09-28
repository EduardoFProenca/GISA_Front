import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { SelectBusca, OpcaoSelectBusca } from '../../../shared/components/select-busca/select-busca';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';
import { PacienteService } from '../../../services/paciente';
import { ProfissionalService } from '../../../services/profissional';
import { TerapiaService } from '../../../services/terapia';
import { PacienteResumo } from '../../../core/models/paciente-resumo.model';
import { ProfissionalResumo } from '../../../core/models/profissional-resumo.model';
import { Modalidade, NovaTerapia } from '../../../core/models/consulta.model';

// Chave de erro da API -> campo da tela
const CAMPOS_API: Record<string, string> = {
  idPaciente: 'paciente',
  idEspecialista: 'especialista',
  modalidade: 'modalidade',
  dataHoraInicio: 'data',
  dataHoraFim: 'horaTermino',
};

@Component({
  selector: 'app-criar-consulta',
  imports: [FormsModule, CabecalhoPagina, SucessoDialog, SelectBusca],
  templateUrl: './criar-consulta.html',
  styleUrl: './criar-consulta.scss',
})
export class CriarConsulta implements OnInit {
  private pacienteService = inject(PacienteService);
  private profissionalService = inject(ProfissionalService);
  private terapiaService = inject(TerapiaService);
  private router = inject(Router);

  // Listas dos selects
  pacientes = signal<PacienteResumo[]>([]);
  especialistas = signal<ProfissionalResumo[]>([]);

  opcoesPacientes = signal<OpcaoSelectBusca[]>([]);
  opcoesEspecialistas = signal<OpcaoSelectBusca[]>([]);
  modalidades = [
    { valor: Modalidade.INDIVIDUAL, label: 'Individual' },
    { valor: Modalidade.COLETIVA, label: 'Coletiva' },
  ];

  // Campos do formulário
  idPaciente = signal<number | null>(null);
  idEspecialista = signal<number | null>(null);
  modalidade = signal<Modalidade | ''>('');
  data = signal('');
  horaInicio = signal('');
  horaTermino = signal('');

  // Estado da tela
  erros = signal<Record<string, string>>({});
  erro = signal('');
  salvando = signal(false);
  dialogSucessoAberto = signal(false);

  ngOnInit() {
    this.pacienteService.listar().subscribe({
      next: (lista) => {
        this.pacientes.set(lista);
        this.opcoesPacientes.set(lista.map((p) => ({ id: p.idCadastro, label: p.nome })));
      },
      error: () => this.erro.set('Não foi possível carregar a lista de pacientes.'),
    });

    this.profissionalService.listarEspecialistas().subscribe({
      next: (lista) => {
        this.especialistas.set(lista);
        this.opcoesEspecialistas.set(lista.map((e) => ({ id: e.idProfissional, label: e.nome })));
      },
      error: () => this.erro.set('Não foi possível carregar a lista de profissionais.'),
    });
  }

  aoMudarPaciente(id: number | string | null) {
    this.idPaciente.set(id as number | null);
    this.limparErro('paciente');
  }

  aoMudarEspecialista(id: number | string | null) {
    this.idEspecialista.set(id as number | null);
    this.limparErro('especialista');
  }

  limparErro(campo: string) {
    if (!this.erros()[campo]) return;
    this.erros.update((e) => {
      const copia = { ...e };
      delete copia[campo];
      return copia;
    });
  }

  // ---------- validação ----------

  private validar(): boolean {
    const OBRIGATORIO = 'Campo obrigatório.';
    const e: Record<string, string> = {};

    if (this.idPaciente() == null) e['paciente'] = OBRIGATORIO;
    if (this.idEspecialista() == null) e['especialista'] = OBRIGATORIO;
    if (!this.modalidade()) e['modalidade'] = OBRIGATORIO;
    if (!this.data()) e['data'] = OBRIGATORIO;
    if (!this.horaInicio()) e['horaInicio'] = OBRIGATORIO;

    if (!this.horaTermino()) {
      e['horaTermino'] = OBRIGATORIO;
    } else if (this.horaInicio() && this.horaTermino() <= this.horaInicio()) {
      e['horaTermino'] = 'O término deve ser depois do início.';
    }

    this.erros.set(e);
    return Object.keys(e).length === 0;
  }

  // ---------- salvar ----------

  salvarConsulta() {
    if (this.salvando()) return;

    this.erro.set('');
    if (!this.validar()) {
      this.finalizarComErro('Preencha os campos obrigatórios destacados em vermelho.');
      return;
    }

    this.salvando.set(true);

    const dados: NovaTerapia = {
      idPaciente: this.idPaciente()!,
      idEspecialista: this.idEspecialista()!,
      modalidade: this.modalidade() as Modalidade,
      dataHoraInicio: `${this.data()}T${this.horaInicio()}:00`,
      dataHoraFim: `${this.data()}T${this.horaTermino()}:00`,
    };

    this.terapiaService.criar(dados).subscribe({
      next: () => {
        this.salvando.set(false);
        this.dialogSucessoAberto.set(true);
      },
      error: (err: HttpErrorResponse) => this.tratarErroApi(err),
    });
  }

  private tratarErroApi(err: HttpErrorResponse) {
    if (err.status === 0) {
      this.finalizarComErro('Não foi possível conectar ao servidor. Tente novamente.');
      return;
    }

    const campos: Record<string, string> = err.error?.fields ?? {};
    const novos: Record<string, string> = {};
    const semDestino: string[] = [];

    for (const [chave, mensagem] of Object.entries(campos)) {
      const nome = chave.split('.').pop()!.replace(/\[\d+\]/g, '');
      const destino = CAMPOS_API[nome];
      if (destino) novos[destino] = mensagem;
      else semDestino.push(mensagem);
    }

    const mapeados = Object.keys(novos).length;
    if (mapeados > 0) this.erros.update((e) => ({ ...e, ...novos }));

    let mensagemGeral = err.error?.message || 'Erro ao salvar a consulta.';
    if (mapeados > 0) mensagemGeral = 'Corrija os campos destacados em vermelho.';
    if (semDestino.length) mensagemGeral += ' ' + semDestino.join(' ');

    this.finalizarComErro(mensagemGeral);
  }

  private finalizarComErro(mensagem: string) {
    this.salvando.set(false);
    this.erro.set(mensagem);
    setTimeout(() => {
      document.querySelector('.input-erro')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  // ---------- diálogo de sucesso ----------

  private limparFormulario() {
    this.idPaciente.set(null);
    this.idEspecialista.set(null);
    this.modalidade.set('');
    this.data.set('');
    this.horaInicio.set('');
    this.horaTermino.set('');
    this.erros.set({});
    this.erro.set('');
  }

  aoCriarOutra() {
    this.dialogSucessoAberto.set(false);
    this.limparFormulario();
  }

  aoVoltarInicio() {
    this.dialogSucessoAberto.set(false);
    this.router.navigateByUrl('/administrador');
  }
}