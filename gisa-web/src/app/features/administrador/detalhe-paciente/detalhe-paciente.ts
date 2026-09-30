import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';

@Component({
  selector: 'app-detalhe-paciente',
  standalone: true,
  imports: [
    CommonModule,
    CabecalhoPagina,
    DadosPessoais,
    Contato
  ],
  templateUrl: './detalhe-paciente.html',
  styleUrl: './detalhe-paciente.scss'
})
export class DetalhePaciente implements OnInit {
  private route = inject(ActivatedRoute);

  id: string = this.route.snapshot.paramMap.get('id') ?? '';
  status: 'MATRICULADO' | 'INATIVO' = 'MATRICULADO';

  dadosPessoais: any = {};
  contato: any = {};
  infoEscola: any = {};
  infoResponsavel: any = {};
  infoProntuario: any = {};
  infoCid: any = {};

  ngOnInit(): void {
    // TODO: Substituir pelo carregamento real via PacienteService futuramente
    const pacienteMock = {
      dadosPessoais: {
        nome: 'Lucas Oliveira Santos',
        cpf: '123.456.789-00',
        email: 'lucas.santos@email.com',
        dataNascimento: '2015-05-10',
        sexo: 'M',
        celular: '(11) 98765-4321',
        estadoCivil: 'SOLTEIRO',
        numCNS: '000 1111 2222 3333'
      },
      contato: {
        cep: '01001-000',
        endereco: 'Praça da Sé',
        numero: '100',
        complemento: '',
        bairro: 'Sé',
        cidade: 'São Paulo',
        uf: 'SP'
      },
      infoEscola: {
        nomeEscola: 'Escola Municipal Monteiro Lobato',
        serie: '5º Ano',
        turno: 'Manhã'
      },
      infoResponsavel: {
        nome: 'Maria Santos',
        cpf: '000.111.222-33',
        telefone: '(11) 98765-4321',
        grauParentesco: 'Mãe'
      },
      infoProntuario: {
        numeroProntuario: 'PRONT-2024-001',
        observacoes: 'Paciente apresenta acompanhamento em dia.'
      },
      infoCid: {
        codigoCID: 'F84.0',
        descricao: 'Autismo Infantil'
      },
      status: 'MATRICULADO' as const
    };

    this.dadosPessoais = pacienteMock.dadosPessoais;
    this.contato = pacienteMock.contato;
    this.infoEscola = pacienteMock.infoEscola;
    this.infoResponsavel = pacienteMock.infoResponsavel;
    this.infoProntuario = pacienteMock.infoProntuario;
    this.infoCid = pacienteMock.infoCid;
    this.status = pacienteMock.status;
  }
}