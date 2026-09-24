import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { InfoProfissional } from '../cadastrar-profissional/formularios/info-profissional/info-profissional';
import { InfoUsuario } from '../cadastrar-profissional/formularios/info-usuario/info-usuario';
import { InfoEspecialista } from '../cadastrar-profissional/formularios/info-especialista/info-especialista';

@Component({
  selector: 'app-detalhe-profissional',
  imports: [
    CabecalhoPagina,
    DadosPessoais,
    Contato,
    InfoProfissional,
    InfoUsuario,
    InfoEspecialista,
  ],
  templateUrl: './detalhe-profissional.html',
  styleUrl: './detalhe-profissional.scss',
})
export class DetalheProfissional implements OnInit {
  private route = inject(ActivatedRoute);

  id: string = this.route.snapshot.paramMap.get('id') ?? '';

  status: 'ATIVO' | 'INATIVO' = 'ATIVO';

  dadosPessoais: any = {};
  contato: any = {};
  infoProfissional: any = {};
  infoUsuario: any = {};
  infoEspecialista: any = {};

  ngOnInit() {
    // TODO: trocar pelo carregamento real via service, usando this.id
    const profissionalMock = {
      dadosPessoais: {
        nome: 'Roberto Almeida',
        cpf: '123.456.789-00',
        email: 'roberto@apae.org',
        dataNascimento: '1985-04-12',
        sexo: 'M',
        celular: '(11) 98888-7777',
        estadoCivil: 'CASADO',
        numCNS: '000 1111 2222 3333',
      },
      contato: {
        cep: '01001-000',
        endereco: 'Praça da Sé',
        numero: '100',
        complemento: '',
        bairro: 'Sé',
        cidade: 'São Paulo',
        uf: 'SP',
      },
      infoProfissional: {
        cargo: 'MEDICO',
        codigoCBO: '225125',
      },
      infoUsuario: {
        temAcessoSistema: true,
        perfil: 'MEDICO',
      },
      infoEspecialista: {
        ehEspecialista: true,
        registroProfissional: 'CRM 123456',
        estadoRegistro: 'SP',
      },
      status: 'ATIVO' as const,
    };

    this.dadosPessoais = profissionalMock.dadosPessoais;
    this.contato = profissionalMock.contato;
    this.infoProfissional = profissionalMock.infoProfissional;
    this.infoUsuario = profissionalMock.infoUsuario;
    this.infoEspecialista = profissionalMock.infoEspecialista;
    this.status = profissionalMock.status;
  }
}