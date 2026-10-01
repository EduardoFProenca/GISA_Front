import { describe, it, expect, beforeEach } from 'vitest';
import { CadastroValidadorService } from './cadastro-validador';
import { CadastroPayloadService } from './cadastro-payload';
import { FormulariosCadastro } from '../models/formularios-cadastro';
import { Especialidade } from '../../../../core/models/especialidade.model';
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
      cargo: 'MEDICO',
      codigoCBO: '',
    }),
    infoUsuario: comErros({
      temAcessoSistema: false,
      senha: '',
      perfil: '',
    }),
    infoEspecialista: comErros({
      ehEspecialista: false,
      registroProfissional: '  CRM-SP 123456  ',
      especialidades: ['pediatria'],
      opcoesEspecialidade: [{ valor: 'pediatria', label: 'Pediatria' }],
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

  it('idCargoPorNome resolve por nome ignorando maiúsculas/underscore', () => {
    const cargos = [{ idCargo: 2, nome: 'Médico' }];
    expect(service.idCargoPorNome(cargos, 'MEDICO')).toBe(2);
  });

  it('idCargoPorNome cai no primeiro cargo da lista quando não encontra o nome', () => {
    const cargos = [{ idCargo: 5, nome: 'Recepcionista' }];
    expect(service.idCargoPorNome(cargos, 'INEXISTENTE')).toBe(5);
  });

  it('idPerfilPorNome resolve por nome ignorando maiúsculas/underscore', () => {
    const perfis = [{ idPerfil: 3, nome: 'Assistente Social' }];
    expect(service.idPerfilPorNome(perfis, 'ASSISTENTE_SOCIAL')).toBe(3);
  });

  it('montarEndereco remove máscara do CEP e recorta os espaços', () => {
    const endereco = service.montarEndereco(formularioBase());

    expect(endereco.cep).toBe('01001000');
    expect(endereco.rua).toBe('Praça da Sé');
    expect(endereco.complemento).toBe('Apto 12');
  });

  it('montarDadosBase remove máscara de CPF, celular e CNS, e resolve o idCargo', () => {
    const f = formularioBase();
    const cargos = [{ idCargo: 2, nome: 'Médico' }];

    const dados = service.montarDadosBase(f, cargos);

    expect(dados.nome).toBe('Maria Silva');
    expect(dados.cpf).toBe('12345678901');
    expect(dados.celular).toBe('11999999999');
    expect(dados.numCNS).toBe('123456789012345');
    expect(dados.idCargo).toBe(2);
  });

  it('montarUsuario retorna null quando o profissional não tem acesso ao sistema', () => {
    const f = formularioBase();
    expect(service.montarUsuario(f, [])).toBeNull();
  });

  it('montarUsuario resolve o idPerfil quando há acesso ao sistema', () => {
    const f = formularioBase();
    f.infoUsuario.temAcessoSistema = true;
    f.infoUsuario.senha = 'SenhaSegura123';
    f.infoUsuario.perfil = 'MEDICO';
    const perfis = [{ idPerfil: 2, nome: 'Médico' }];

    const usuario = service.montarUsuario(f, perfis);

    expect(usuario).toEqual({ senha: 'SenhaSegura123', idPerfil: 2 });
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

  it('mapearEspecialidadesIds casa o label da opção selecionada com o nome retornado pela API', () => {
    const f = formularioBase();
    f.infoEspecialista.especialidades = ['pediatria'];
    f.infoEspecialista.opcoesEspecialidade = [{ valor: 'pediatria', label: 'Pediatria' }];

    const todas: Especialidade[] = [
      { idEspecialidade: 7, nome: 'Pediatria', descricao: '' },
      { idEspecialidade: 8, nome: 'Neurologia', descricao: '' },
    ];

    expect(service.mapearEspecialidadesIds(f, todas)).toEqual([7]);
  });

  it('mapearEspecialidadesIds ignora especialidade sem correspondência na API', () => {
    const f = formularioBase();
    f.infoEspecialista.especialidades = ['pediatria'];
    f.infoEspecialista.opcoesEspecialidade = [{ valor: 'pediatria', label: 'Pediatria' }];

    const todas: Especialidade[] = [{ idEspecialidade: 8, nome: 'Neurologia', descricao: '' }];

    expect(service.mapearEspecialidadesIds(f, todas)).toEqual([]);
  });

  it('montarDadosEspecialista recorta o registro e inclui as jornadas mapeadas', () => {
    const f = formularioBase();
    const dadosBase = service.montarDadosBase(f, [{ idCargo: 2, nome: 'Médico' }]);

    const dadosEspecialista = service.montarDadosEspecialista(f, dadosBase, [7]);

    expect(dadosEspecialista.registroConselho).toBe('CRM-SP 123456');
    expect(dadosEspecialista.especialidadesIds).toEqual([7]);
    expect(dadosEspecialista.jornadas.length).toBe(1);
  });

  it('montarDadosEspecialistaPJ remove máscara do CNPJ e recorta a razão social', () => {
    const f = formularioBase();
    const dadosBase = service.montarDadosBase(f, [{ idCargo: 2, nome: 'Médico' }]);
    const dadosEspecialista = service.montarDadosEspecialista(f, dadosBase, [7]);

    const dadosPJ = service.montarDadosEspecialistaPJ(f, dadosEspecialista);

    expect(dadosPJ.cnpj).toBe('12345678000195');
    expect(dadosPJ.razaoSocial).toBe('Clínica Exemplo Ltda');
    expect(dadosPJ.nomeFantasia).toBe('Clínica Exemplo');
  });
});