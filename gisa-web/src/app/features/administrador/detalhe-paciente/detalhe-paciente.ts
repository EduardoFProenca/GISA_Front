import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lerContextoPacientes } from '../../../core/routing/contexto-pacientes';

import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { Cid, GrauParentesco, StatusPaciente, TipoEscola } from '../../../core/models/paciente.model';

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

interface ResponsavelDetalhe {
  nome: string;
  cpf: string;
  celular: string;
  grauParentesco: GrauParentesco;
}

@Component({
  selector: 'app-detalhe-paciente',
  imports: [CabecalhoPagina, DadosPessoais, Contato],
  templateUrl: './detalhe-paciente.html',
  styleUrl: './detalhe-paciente.scss'
})
export class DetalhePaciente implements OnInit {
  private route = inject(ActivatedRoute);

  id: string = this.route.snapshot.paramMap.get('id') ?? '';
  // Perfil de leitura (ex.: Assistente Social): esconde o botão "Editar".
  somenteLeitura = lerContextoPacientes(this.route).somenteLeitura;
  status: StatusPaciente = 'MATRICULADO';

  dadosPessoais: any = {};
  contato: any = {};
  infoEscola: { nome: string; tipoEscola: TipoEscola; telefone: string } | null = null;
  responsaveis: ResponsavelDetalhe[] = [];
  infoProntuario = { alergias: '', comorbidade: '', mobilidade: '' };
  cids: Cid[] = [];

  ngOnInit(): void {
    // TODO: carregar do back. A documentação da API ainda não tem GET /pacientes/{id};
    // quando existir, trocar este mock pelo PacienteService (mesmos campos do cadastro).
    this.dadosPessoais = {
      nome: 'Lucas Oliveira Santos',
      cpf: '123.456.789-00',
      email: 'lucas.santos@email.com',
      dataNascimento: '2015-05-10',
      sexo: 'M',
      celular: '(11) 98765-4321',
      estadoCivil: 'SOLTEIRO',
      numCNS: '000 1111 2222 3333'
    };
    this.contato = {
      cep: '01001-000',
      endereco: 'Praça da Sé',
      numero: '100',
      complemento: '',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP'
    };
    this.infoEscola = {
      nome: 'Escola Municipal Monteiro Lobato',
      tipoEscola: 'PUBLICA',
      telefone: '(11) 3333-0000'
    };
    this.responsaveis = [
      { nome: 'Maria Santos', cpf: '000.111.222-33', celular: '(11) 98765-4321', grauParentesco: 'MAE' },
      { nome: 'Carlos Santos', cpf: '111.222.333-44', celular: '', grauParentesco: 'PAI' }
    ];
    this.infoProntuario = {
      alergias: 'Nenhuma conhecida',
      comorbidade: 'Rinite alérgica',
      mobilidade: 'Anda sem auxílio'
    };
    this.cids = [{ codigoCID: 'F84.0', descricao: 'Autismo infantil' }];
    this.status = 'MATRICULADO';
  }

  get rotuloStatus(): string {
    return ROTULO_STATUS[this.status];
  }

  rotuloParentesco(grau: GrauParentesco): string {
    return ROTULO_PARENTESCO[grau];
  }

  rotuloEscola(tipo: TipoEscola): string {
    return ROTULO_ESCOLA[tipo];
  }
}
