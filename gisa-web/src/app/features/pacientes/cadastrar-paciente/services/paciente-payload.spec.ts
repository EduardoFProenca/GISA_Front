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

function responsavel(nome: string, cpf: string, naoReside: boolean, residencia: string[] = []): ResponsavelItem {
  return {
    nome, cpf, dataNascimento: '1980-01-01', sexo: 'F', estadoCivil: 'CASADO', celular: '', ocupacao: '',
    grauParentesco: 'MAE', naoResideComPaciente: naoReside, residencia, endereco: null,
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

  it('2 endereços: quem mora nos dois vai com [0, 1] e quem não reside com []', () => {
    lista.enderecosIniciais = [ENDERECO_1, ENDERECO_2];
    const f = formulariosPaciente(lista, [
      responsavel('Ana', '111.444.777-35', false, ['id-5', 'id-9']),
      responsavel('Bruno', '123.456.789-09', true),
    ]);

    const dados = payload.montar(f);

    expect(dados.enderecos.length).toBe(2);
    expect(dados.responsaveis[0].indicesEnderecoResidencia).toEqual([0, 1]);
    expect(dados.responsaveis[1].indicesEnderecoResidencia).toEqual([]);
    expect('naoResideComPaciente' in dados.responsaveis[0]).toBe(false);
  });

  it('pais separados: mãe no 1º e pai no 2º vão com [0] e [1]', () => {
    lista.enderecosIniciais = [ENDERECO_1, ENDERECO_2];
    const f = formulariosPaciente(lista, [
      responsavel('Mãe', '111.444.777-35', false, ['id-5']),
      responsavel('Pai', '123.456.789-09', false, ['id-9']),
    ]);

    const dados = payload.montar(f);

    expect(dados.responsaveis.map((r) => r.indicesEnderecoResidencia)).toEqual([[0], [1]]);
  });

  it('edição: paraApi() mantém os IDs dos endereços da API e manda os novos sem ID', () => {
    lista.enderecosIniciais = [ENDERECO_1, ENDERECO_2];
    lista.adicionar({ cep: '18020-000', endereco: 'Rua C', numero: '30', complemento: '', bairro: 'Vila', cidade: 'Sorocaba', uf: 'SP' });

    const novo = lista.itens[2].chave;

    const dados = payload.montar(formulariosPaciente(lista, [responsavel('Ana', '111.444.777-35', false, ['id-9', novo])]));

    expect(dados.enderecos.map((e) => e.idEndereco)).toEqual([5, 9, undefined]);
    expect(dados.enderecos[0].cep).toBe('18000000');
    expect(dados.responsaveis[0].indicesEnderecoResidencia).toEqual([1, 2]);
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
      ...responsavel('Ana', '111.444.777-35', false, ['id-9']), idResponsavel: 3, reaproveitado: true,
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

describe('PacienteValidadorService: "Quem mora aqui"', () => {
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
    lista.enderecosIniciais = [ENDERECO_1, ENDERECO_2];
  });

  it('2 endereços e alguém que reside sem endereço marcado: erro sob a lista com o nome', () => {
    const f = formulariosPaciente(lista, [
      responsavel('Mãe', '111.444.777-35', false, ['id-5']),
      responsavel('Pai', '123.456.789-09', false, []),
    ]);
    expect(validador.validar(f).valido).toBe(false);
    expect(lista.erros['enderecos']).toBe('Marque em qual endereço mora: Pai.');
  });

  it('quem não reside não precisa de endereço marcado', () => {
    const f = formulariosPaciente(lista, [
      responsavel('Mãe', '111.444.777-35', false, ['id-5']),
      responsavel('Pai', '123.456.789-09', true, []),
    ]);
    expect(validador.validar(f).valido).toBe(true);
  });

  it('não reside com endereço próprio igual a um do paciente: erro no card', () => {
    const r = {
      ...responsavel('Pai', '123.456.789-09', true), idResponsavel: 4, reaproveitado: true,
      enderecoCadastro: { cep: '18010-000', endereco: 'Rua B', numero: '20', complemento: 'apto 2', bairro: 'Jardim', cidade: 'Sorocaba', uf: 'SP' },
    };
    const resultado = validador.validarResponsavel(r, undefined, [], null, lista.itens);
    expect(resultado.valido).toBe(false);
    expect(resultado.erros['residencia']).toContain('Este é um endereço do paciente');
  });
});
