import { describe, it, expect, beforeEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { CadastroErrosApiService } from './cadastro-erros-api';
import { FormulariosCadastro } from '../models/formularios-cadastro';
import { comErros } from './test-helpers';

function formularioVazio(): FormulariosCadastro {
  return {
    dadosPessoais: comErros({
      nome: '', cpf: '', email: '', dataNascimento: '', sexo: '', celular: '', estadoCivil: '', numCNS: '',
    }),
    contato: comErros({
      cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
    }),
    infoProfissional: comErros({ cargo: '', codigoCBO: '' }),
    infoUsuario: comErros({ temAcessoSistema: false, senha: '', perfil: '' }),
    infoEspecialista: comErros({
      ehEspecialista: false,
      registroProfissional: '',
      especialidades: [] as string[],
      opcoesEspecialidade: [] as { valor: string; label: string }[],
      jornadas: [] as { diaSemana: string | number; horaInicio: string; horaTermino: string }[],
      atuaComoPJ: false,
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      inscricaoEstadual: '',
    }),
  };
}

function erroApi(status: number, body: any): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('CadastroErrosApiService', () => {
  let service: CadastroErrosApiService;

  beforeEach(() => {
    service = new CadastroErrosApiService();
  });

  it('trata falha de rede (status 0) sem tentar ler "fields"', () => {
    const f = formularioVazio();
    const resultado = service.tratar(erroApi(0, null), f);

    expect(resultado.mensagemGeral).toContain('conectar ao servidor');
    expect(resultado.algumCampoMarcado).toBe(false);
  });

  it('mapeia erro de validação (400) do campo "cpf" para dadosPessoais.erros', () => {
    const f = formularioVazio();
    const err = erroApi(400, {
      message: 'Erro de validacao dos dados.',
      fields: { cpf: 'O CPF deve conter 11 digitos numericos' },
    });

    const resultado = service.tratar(err, f);

    expect(f.dadosPessoais.erros['cpf']).toBe('O CPF deve conter 11 digitos numericos');
    expect(resultado.algumCampoMarcado).toBe(true);
    expect(resultado.mensagemGeral).toContain('destacados em vermelho');
  });

  it('mapeia chave aninhada "enderecos[0].cep" para contato.erros.cep', () => {
    const f = formularioVazio();
    const err = erroApi(400, { fields: { 'enderecos[0].cep': 'CEP inválido' } });

    service.tratar(err, f);

    expect(f.contato.erros['cep']).toBe('CEP inválido');
  });

  it('em conflito (409), usa mensagem de "já existe no sistema"', () => {
    const f = formularioVazio();
    const err = erroApi(409, { fields: { cpf: 'CPF já cadastrado' } });

    const resultado = service.tratar(err, f);

    expect(resultado.mensagemGeral).toContain('já existem no sistema');
  });

  it('acumula mensagens de campos sem componente correspondente na mensagem geral', () => {
    const f = formularioVazio();
    const err = erroApi(400, { fields: { campoDesconhecido: 'Algo obscuro aconteceu' } });

    const resultado = service.tratar(err, f);

    expect(resultado.algumCampoMarcado).toBe(false);
    expect(resultado.mensagemGeral).toContain('Algo obscuro aconteceu');
  });

  it('sem "fields", usa a "message" da API como mensagem geral', () => {
    const f = formularioVazio();
    const err = erroApi(500, { message: 'Erro interno do servidor' });

    const resultado = service.tratar(err, f);

    expect(resultado.mensagemGeral).toBe('Erro interno do servidor');
    expect(resultado.algumCampoMarcado).toBe(false);
  });
});