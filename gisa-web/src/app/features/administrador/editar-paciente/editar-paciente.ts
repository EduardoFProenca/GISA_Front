import { ChangeDetectorRef, Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Componentes Compartilhados
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { ComErros } from '../../../shared/components/com-erros';
import { StatusPaciente } from '../../../core/models/paciente.model';
import { PacienteDetalhe } from '../../../core/models/paciente-detalhe.model';
import { PacienteService } from '../../../services/paciente';
import { PacienteValidadorService } from '../cadastrar-paciente/services/paciente-validador';
import { formatarCelular, formatarCep, formatarCpf } from '../../../shared/utils/formatacao.util';
import { soDigitos, vazio } from '../../../shared/utils/texto.util';

@Component({
  selector: 'app-editar-paciente',
  imports: [
    FormsModule,
    CabecalhoPagina,
    ConfirmDialog,
    SucessoDialog,
    DadosPessoais,
    Contato
  ],
  templateUrl: './editar-paciente.html',
  styleUrl: './editar-paciente.scss'
})
export class EditarPaciente implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);
  private pacienteService = inject(PacienteService);
  private validador = inject(PacienteValidadorService);

  // Os formulários filhos só existem depois que o paciente carrega.
  @ViewChild(DadosPessoais) dadosPessoaisForm?: DadosPessoais;
  @ViewChild(Contato) contatoForm?: Contato;

  id = signal(this.route.snapshot.paramMap.get('id') ?? '');

  // Signals: respostas assíncronas (carregar/salvar) só atualizam a tela se o template ler signals.
  carregando = signal(true);
  erro = signal('');
  erroGeral = signal('');
  paciente = signal<PacienteDetalhe | null>(null);
  status = signal<StatusPaciente>('MATRICULADO');
  salvando = signal(false);
  dialogSucessoAberto = signal(false);
  nomeSalvo = signal('');

  confirmarCancelamentoAberto = false;

  dadosPessoais = computed(() => {
    const p = this.paciente();
    if (!p) return {};
    return {
      nome: p.nome,
      cpf: formatarCpf(p.cpf),
      email: '',
      dataNascimento: p.dataNascimento,
      sexo: p.sexo,
      celular: formatarCelular(p.celular),
      estadoCivil: p.estadoCivil,
      numCNS: p.numCNS ?? '',
    };
  });

  contato = computed(() => {
    const p = this.paciente();
    return p ? { ...p.endereco, cep: formatarCep(p.endereco.cep) } : {};
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id.set(params.get('id') ?? '');
      this.carregar();
    });
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.paciente.set(null);

    // Com environment.usarDadosExemplo = true vem de core/data/pacientes-exemplo.ts.
    this.pacienteService.buscarPorId(Number(this.id())).subscribe({
      next: (p) => {
        this.paciente.set(p);
        this.status.set(p.statusPaciente);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.status === 404 ? 'Paciente não encontrado.' : 'Não foi possível carregar o paciente.');
        this.carregando.set(false);
      },
    });
  }

  salvarEdicao() {
    const dp = this.dadosPessoaisForm;
    const ct = this.contatoForm;
    if (!dp || !ct || this.salvando()) return;

    dp.erros = {};
    ct.erros = {};
    this.erroGeral.set('');

    let valido = true;
    const marcar = (alvo: ComErros, campo: string, mensagem = 'Campo obrigatório.') => {
      alvo.erros[campo] = mensagem;
      valido = false;
    };

    if (vazio(dp.nome)) marcar(dp, 'nome');
    const celular = soDigitos(dp.celular);
    if (celular && (celular.length < 10 || celular.length > 11)) {
      marcar(dp, 'celular', 'Celular inválido. Use DDD + número.');
    }
    this.validador.validarEndereco(ct, marcar);

    if (!valido) {
      this.erroGeral.set('Preencha os campos obrigatórios destacados em vermelho.');
      this.cdr.markForCheck();
      setTimeout(() => {
        document.querySelector('.input-erro, .erro-msg')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    this.salvando.set(true);
    this.pacienteService
      .editar(Number(this.id()), {
        nome: dp.nome.trim(),
        estadoCivil: dp.estadoCivil,
        celular: celular || undefined,
        numCNS: soDigitos(dp.numCNS) || undefined,
        statusPaciente: this.status(),
        enderecos: [
          {
            cep: soDigitos(ct.cep),
            rua: ct.endereco.trim(),
            numero: ct.numero.trim(),
            complemento: ct.complemento?.trim() || undefined,
            bairro: ct.bairro.trim(),
            cidade: ct.cidade.trim(),
            estado: ct.uf,
          },
        ],
      })
      .subscribe({
        next: () => {
          this.nomeSalvo.set(dp.nome.trim());
          this.salvando.set(false);
          this.dialogSucessoAberto.set(true);
        },
        error: (err) => {
          this.salvando.set(false);
          this.erroGeral.set(err?.error?.message || 'Não foi possível salvar as alterações.');
        },
      });
  }

  irParaGerenciarPacientes() {
    this.dialogSucessoAberto.set(false);
    this.router.navigate(['/administrador/pacientes/gerenciar']);
  }

  irParaDetalhes() {
    this.dialogSucessoAberto.set(false);
    this.router.navigate(['/administrador/pacientes', this.id()]);
  }

  cancelar() {
    this.confirmarCancelamentoAberto = true;
  }

  confirmarCancelamento() {
    this.confirmarCancelamentoAberto = false;
    this.location.back();
  }

  fecharConfirmacao() {
    this.confirmarCancelamentoAberto = false;
  }
}
