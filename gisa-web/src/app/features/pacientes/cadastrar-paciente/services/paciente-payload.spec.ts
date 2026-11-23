import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ListaEnderecos } from '../../../../shared/components/lista-enderecos/lista-enderecos';
import { Endereco } from '../../../../core/models/comum.model';
import { FormulariosPaciente, ResponsavelItem } from '../models/formularios-paciente';
import { PacienteCadastroPayloadService } from './paciente-payload';
import { PacienteValidadorService } from './paciente-validador';

const ENDERECO_1: Endereco = {
  idEndereco: 5, cep: '18000000', rua: 'Rua A', numero: '10', complemento: null, bairro: 'Centro', cidade: 'Sorocaba', estado: 'SP',
};
const ENDERECO_2: Endereco = {
  idEndereco: 9, cep: '18010000', rua: 'Rua B', numero: '20', complemento: 'apto 2', bairro: 'Jardim', cidade: 'Sorocaba', estado: 'SP',
};

function comErros<T extends object>(dados: T) {
  return { ...dados, erros: {} as Record<string, string>, limparErro() {} };
}

function responsavel(nome: string, cpf: string, naoReside: boolean): ResponsavelItem {
  return {
    nome, cpf, dataNascimento: '1980-01-01', sexo: 'F', estadoCivil: 'CASADO', celular: '', ocupacao: '',
    grauParentesco: 'MAE', naoResideComPaciente: naoReside, endereco: null,
  };
}

// Formulário de paciente completo, com a lista de endereços real.
function formulariosPaciente(enderecos: ListaEnderecos, responsaveis: ResponsavelItem[]): FormulariosPaciente {
  return {
    dadosPessoais: comErros({
      nome: 'Paciente Teste', cpf: '529.982.247-25', email: '', dataNascimento: '2015-01-01', sexo: 'M',
      celular: '', estadoCivil: 'SOLTEIRO', numCNS: '',
    }),
    enderecos,
    infoPaciente: comErros({ convenio: false }),
    infoResponsavel: comErros({ listaResponsaveis: responsaveis, exibindoFormulario: false }),
    infoEscola: comErros({ nome: '', tipoEscola: '' as const, telefone: '', escolaSelecionada: null }),
    infoProntuario: comErros({ alergias: '', comorbidade: '', mobilidade: '' }),
    infoCid: comErros({ listaCids: () => [] }),
  };
}

describe('PacienteCadastroPayloadService: endereços e residência', () => {
  let payload: PacienteCadastroPayloadService;
  let lista: ListaEnderecos;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaEnderecos],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    payload = TestBed.inject(PacienteCadastroPayloadService);
    lista = TestBed.createComponent(ListaEnderecos).componentInstance;
  });

  it('2 endereços: quem reside vai com [0, 1] e quem não reside com []', () => {
    lista.enderecosIniciais = [ENDERECO_1, ENDERECO_2];
    const f = formulariosPaciente(lista, [
      responsavel('Ana', '111.444.777-35', false),
      responsavel('Bruno', '123.456.789-09', true),
    ]);

    const dados = payload.montar(f);

    expect(dados.enderecos.length).toBe(2);
    expect(dados.responsaveis[0].indicesEnderecoResidencia).toEqual([0, 1]);
    expect(dados.responsaveis[1].indicesEnderecoResidencia).toEqual([]);
    expect('naoResideComPaciente' in dados.responsaveis[0]).toBe(false);
  });

  it('edição: paraApi() mantém os IDs dos endereços da API e manda os novos sem ID', () => {
    lista.enderecosIniciais = [ENDERECO_1, ENDERECO_2];
    lista.adicionar({ cep: '18020-000', endereco: 'Rua C', numero: '30', complemento: '', bairro: 'Vila', cidade: 'Sorocaba', uf: 'SP' });

    const dados = payload.montar(formulariosPaciente(lista, [responsavel('Ana', '111.444.777-35', false)]));

    expect(dados.enderecos.map((e) => e.idEndereco)).toEqual([5, 9, undefined]);
    expect(dados.enderecos[0].cep).toBe('18000000');
    expect(dados.responsaveis[0].indicesEnderecoResidencia).toEqual([0, 1, 2]);
  });
});

describe('PacienteValidadorService: endereço obrigatório', () => {
  let validador: PacienteValidadorService;
  let lista: ListaEnderecos;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaEnderecos],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    validador = TestBed.inject(PacienteValidadorService);
    lista = TestBed.createComponent(ListaEnderecos).componentInstance;
    lista.obrigatorio = true;
  });

  it('sem endereço: inválido, com "Informe ao menos um endereço." sob a lista', () => {
    const f = formulariosPaciente(lista, [responsavel('Ana', '111.444.777-35', false)]);
    expect(validador.validar(f).valido).toBe(false);
    expect(lista.erros['enderecos']).toBe('Informe ao menos um endereço.');
  });

  it('com endereço: válido', () => {
    lista.enderecosIniciais = [ENDERECO_1];
    const f = formulariosPaciente(lista, [responsavel('Ana', '111.444.777-35', false)]);
    expect(validador.validar(f).valido).toBe(true);
  });

  it('responsável que passa a residir com endereço cadastrado igual ao 2º da lista: aceita', () => {
    lista.enderecosIniciais = [ENDERECO_1, ENDERECO_2];
    const r = {
      ...responsavel('Ana', '111.444.777-35', false), idResponsavel: 3, reaproveitado: true,
      enderecoCadastro: { cep: '18010-000', endereco: 'Rua B', numero: '20', complemento: 'apto 2', bairro: 'Jardim', cidade: 'Sorocaba', uf: 'SP' },
    };
    const f = formulariosPaciente(lista, [r]);
    expect(validador.validar(f).valido).toBe(true);
  });

  it('responsável que passa a residir com endereço fora da lista: erro nos responsáveis', () => {
    lista.enderecosIniciais = [ENDERECO_1];
    const r = {
      ...responsavel('Ana', '111.444.777-35', false), idResponsavel: 3, reaproveitado: true,
      enderecoCadastro: { cep: '18010-000', endereco: 'Rua B', numero: '20', complemento: '', bairro: 'Jardim', cidade: 'Sorocaba', uf: 'SP' },
    };
    const f = formulariosPaciente(lista, [r]);
    expect(validador.validar(f).valido).toBe(false);
    expect(f.infoResponsavel.erros['responsaveis']).toContain('Ana');
  });
});
