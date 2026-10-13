import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { GrauParentesco, StatusPaciente } from '../../../core/models/paciente.model';
import { TipoEscola } from '../../../core/models/escola.model';
import { PacienteDetalhe } from '../../../core/models/paciente-detalhe.model';
import { lerContextoPacientes } from '../../../core/routing/contexto-pacientes';
import { PacienteService } from '../../../services/paciente';
import { formatarCelular, formatarCep, formatarCpf } from '../../../shared/utils/formatacao.util';

const ROTULO_STATUS: Record<StatusPaciente, string> = {
  MATRICULADO: 'Matriculado',
  ALTA: 'Alta',
  DESLIGADO: 'Desligado',
};

const ROTULO_PARENTESCO: Record<GrauParentesco, string> = {
  PAI: 'Pai',
  MAE: 'Mãe',
  AVO: 'Avô / Avó',
  TUTOR_LEGAL: 'Tutor legal',
  OUTRO: 'Outro',
};

const ROTULO_ESCOLA: Record<TipoEscola, string> = {
  PUBLICA: 'Pública',
  PARTICULAR: 'Particular',
};

@Component({
  selector: 'app-detalhe-paciente',
  imports: [CabecalhoPagina, DadosPessoais, Contato],
  templateUrl: './detalhe-paciente.html',
  styleUrl: './detalhe-paciente.scss'
})
export class DetalhePaciente implements OnInit {
  private route = inject(ActivatedRoute);
  private pacienteService = inject(PacienteService);

  id = signal(this.route.snapshot.paramMap.get('id') ?? '');
  // Perfil de leitura (ex.: Assistente Social): esconde o botão "Editar".
  somenteLeitura = lerContextoPacientes(this.route).somenteLeitura;

  // Signals: a resposta HTTP chega fora do ciclo normal e o template precisa reagir a ela.
  carregando = signal(true);
  erro = signal('');
  paciente = signal<PacienteDetalhe | null>(null);

  rotuloStatus = computed(() => {
    const p = this.paciente();
    return p ? ROTULO_STATUS[p.statusPaciente] : '';
  });

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
    // Recarrega também se só o :id da rota mudar (a tela é reaproveitada pelo roteador).
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
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.status === 404 ? 'Paciente não encontrado.' : 'Não foi possível carregar o paciente.');
        this.carregando.set(false);
      },
    });
  }

  rotuloParentesco(grau: GrauParentesco): string {
    return ROTULO_PARENTESCO[grau];
  }

  rotuloEscola(tipo: TipoEscola): string {
    return ROTULO_ESCOLA[tipo];
  }

  cpfFormatado(valor: string): string {
    return formatarCpf(valor);
  }

  celularFormatado(valor: string | null): string {
    return formatarCelular(valor);
  }
}
