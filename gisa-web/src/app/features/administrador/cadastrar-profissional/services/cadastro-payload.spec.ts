import { describe, it, expect, beforeEach } from 'vitest';
import { CadastroValidadorService } from './cadastro-validador';
import { CadastroPayloadService } from './cadastro-payload';
import { FormulariosCadastro } from '../models/formularios-cadastro';
import { comErros } from './test-helpers';

function formularioBase(): FormulariosCadastro {
  return {
    dadosPessoais: comErros({
      nome: '  Maria Silva  ',
      cpf: '123.456.789-01',
      email: ' maria@email.com ',
      dataNascimento: '1990-05-10',
      sexo: 'F',
      celular: '(11) 99999-9999',
      estadoCivil: 'SOLTEIRO',
      numCNS: '123 4567 8901 2345',
    }),
    contato: comErros({
      cep: '01001-000',
      endereco: ' Praça da Sé ',
      numero: '100',
      complemento: ' Apto 12 ',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP',
    }),
    infoProfissional: comErros({
      cargo: '2',
    }),
    infoUsuario: comErros({
      possuiAcesso: false,
      temAcessoSistema: false,
      perfil: '',
    }),
    infoAssistenteSocial: comErros({ ehAssistenteSocial: false, registroConselho: '', idsPacientes: [] as number[] }),
    infoEspecialista: comErros({
      ehEspecialista: false,
      registroProfissional: '  CRM-SP 123456  ',
      especialidades: ['7'],
      opcoesEspecialidade: [{ valor: '7', label: 'Pediatria' }],
      jornadas: [{ diaSemana: 1, horaInicio: '08:00', horaTermino: '17:00' }],
      atuaComoPJ: false,
      cnpj: '12.345.678/0001-95',
      razaoSocial: ' Clínica Exemplo Ltda ',
      nomeFantasia: ' Clínica Exemplo ',
      inscricaoEstadual: '110042490114',
    }),
  };
}

describe('CadastroPayloadService', () => {
  let service: CadastroPayloadService;

  beforeEach(() => {
    service = new CadastroPayloadService(new CadastroValidadorService());
  });

  it('montarEndereco remove máscara do CEP e recorta os espaços', () => {
    const endereco = service.montarEndereco(formularioBase());

    expect(endereco.cep).toBe('01001000');
    expect(endereco.rua).toBe('Praça da Sé');
    expect(endereco.complemento).toBe('Apto 12');
  });

  it('montarDadosBase remove máscara de CPF, celular e CNS, e resolve o idCargo', () => {
    const f = formularioBase();
    const dados = service.montarDadosBase(f);

    expect(dados.nome).toBe('Maria Silva');
    expect(dados.cpf).toBe('12345678901');
    expect(dados.celular).toBe('11999999999');
    expect(dados.numCNS).toBe('123456789012345');
    expect(dados.idCargo).toBe(2);
  });

  it('montarUsuario retorna null quando o profissional não tem acesso ao sistema', () => {
    const f = formularioBase();
    expect(service.montarUsuario(f)).toBeNull();
  });

  it('montarUsuario resolve o idPerfil quando há acesso ao sistema', () => {
    const f = formularioBase();
    f.infoUsuario.temAcessoSistema = true;
    f.infoUsuario.perfil = '2';

    const usuario = service.montarUsuario(f);

    expect(usuario).toEqual({ idPerfil: 2 });
  });

  it('mapearJornadas converte diaSemana para número e ignora linhas incompletas', () => {
    const f = formularioBase();
    f.infoEspecialista.jornadas = [
      { diaSemana: '1', horaInicio: '08:00', horaTermino: '17:00' },
      { diaSemana: '', horaInicio: '', horaTermino: '' },
    ];

    const jornadas = service.mapearJornadas(f);

    expect(jornadas.length).toBe(1);
    expect(jornadas[0].diaSemana).toBe(1);
  });

  it('montarUsuario não concede acesso de novo a quem já tem usuário', () => {
    const f = formularioBase();
    f.infoUsuario.possuiAcesso = true;
    f.infoUsuario.temAcessoSistema = true;
    f.infoUsuario.perfil = '2';

    expect(service.montarUsuario(f)).toBeNull();
  });

  it('especialidadesIds converte os valores do select e remove repetidos', () => {
    const f = formularioBase();
    f.infoEspecialista.especialidades = ['7', '', '7', '8'];

    expect(service.especialidadesIds(f)).toEqual([7, 8]);
  });

  it('montarDadosEspecialista recorta o registro e inclui as jornadas mapeadas', () => {
    const f = formularioBase();
    const dadosBase = service.montarDadosBase(f);

    const dadosEspecialista = service.montarDadosEspecialista(f, dadosBase);

    expect(dadosEspecialista.registroConselho).toBe('CRM-SP 123456');
    expect(dadosEspecialista.especialidadesIds).toEqual([7]);
    expect(dadosEspecialista.jornadas.length).toBe(1);
  });

  it('montarDadosEspecialistaPJ remove máscara do CNPJ e recorta a razão social', () => {
    const f = formularioBase();
    const dadosBase = service.montarDadosBase(f);
    const dadosEspecialista = service.montarDadosEspecialista(f, dadosBase);

    const dadosPJ = service.montarDadosEspecialistaPJ(f, dadosEspecialista);

    expect(dadosPJ.cnpj).toBe('12345678000195');
    expect(dadosPJ.razaoSocial).toBe('Clínica Exemplo Ltda');
    expect(dadosPJ.nomeFantasia).toBe('Clínica Exemplo');
  });
});