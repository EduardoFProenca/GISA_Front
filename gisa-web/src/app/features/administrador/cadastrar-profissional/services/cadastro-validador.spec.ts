import { describe, it, expect, beforeEach } from 'vitest';
import { CadastroValidadorService } from './cadastro-validador';
import { FormulariosCadastro } from '../models/formularios-cadastro';
import { comErros } from './test-helpers';

function formularioValido(): FormulariosCadastro {
  return {
    dadosPessoais: comErros({
      nome: 'Maria Silva',
      cpf: '12345678901',
      email: 'maria@email.com',
      dataNascimento: '1990-05-10',
      sexo: 'F',
      celular: '11999999999',
      estadoCivil: 'SOLTEIRO',
      numCNS: '',
    }),
    contato: comErros({
      cep: '01001000',
      endereco: 'Praça da Sé',
      numero: '100',
      complemento: '',
      bairro: 'Sé',
      cidade: 'São Paulo',
      uf: 'SP',
    }),
    infoProfissional: comErros({
      cargo: 'MEDICO',
      codigoCBO: '',
    }),
    infoUsuario: comErros({
      possuiAcesso: false,
      temAcessoSistema: false,
      senha: '',
      perfil: '',
    }),
    infoEspecialista: comErros({
      ehEspecialista: false,
      registroProfissional: '',
      especialidades: [''],
      opcoesEspecialidade: [{ valor: 'pediatria', label: 'Pediatria' }],
      jornadas: [{ diaSemana: '', horaInicio: '', horaTermino: '' }],
      atuaComoPJ: false,
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      inscricaoEstadual: '',
    }),
  };
}

describe('CadastroValidadorService', () => {
  let service: CadastroValidadorService;

  beforeEach(() => {
    service = new CadastroValidadorService();
  });

  it('aceita um formulário de profissional simples totalmente preenchido', () => {
    const resultado = service.validar(formularioValido());
    expect(resultado.valido).toBe(true);
  });

  it('rejeita nome vazio', () => {
    const f = formularioValido();
    f.dadosPessoais.nome = '  ';

    const resultado = service.validar(f);

    expect(resultado.valido).toBe(false);
    expect(f.dadosPessoais.erros['nome']).toBeTruthy();
  });

  it('rejeita CPF com menos de 11 dígitos', () => {
    const f = formularioValido();
    f.dadosPessoais.cpf = '123.456';

    const resultado = service.validar(f);

    expect(resultado.valido).toBe(false);
    expect(f.dadosPessoais.erros['cpf']).toContain('11 dígitos');
  });

  it('rejeita e-mail sem formato válido', () => {
    const f = formularioValido();
    f.dadosPessoais.email = 'nao-e-um-email';

    const resultado = service.validar(f);

    expect(resultado.valido).toBe(false);
    expect(f.dadosPessoais.erros['email']).toContain('inválido');
  });

  it('exige senha e perfil somente quando "tem acesso ao sistema" está marcado', () => {
    const semAcesso = formularioValido();
    expect(service.validar(semAcesso).valido).toBe(true);

    const comAcesso = formularioValido();
    comAcesso.infoUsuario.temAcessoSistema = true;
    comAcesso.infoUsuario.senha = '';
    comAcesso.infoUsuario.perfil = '';

    const resultado = service.validar(comAcesso);

    expect(resultado.valido).toBe(false);
    expect(comAcesso.infoUsuario.erros['senha']).toBeTruthy();
    expect(comAcesso.infoUsuario.erros['perfil']).toBeTruthy();
  });

  it('rejeita senha fora da faixa de 8 a 30 caracteres', () => {
    const f = formularioValido();
    f.infoUsuario.temAcessoSistema = true;
    f.infoUsuario.senha = '123';
    f.infoUsuario.perfil = 'MEDICO';

    const resultado = service.validar(f);

    expect(resultado.valido).toBe(false);
    expect(f.infoUsuario.erros['senha']).toContain('8 e 30');
  });

  it('exige registro, especialidade e jornada completa quando "é especialista" está marcado', () => {
    const f = formularioValido();
    f.infoEspecialista.ehEspecialista = true;
    f.infoEspecialista.registroProfissional = '';
    f.infoEspecialista.especialidades = [''];
    f.infoEspecialista.jornadas = [{ diaSemana: '', horaInicio: '', horaTermino: '' }];

    const resultado = service.validar(f);

    expect(resultado.valido).toBe(false);
    expect(f.infoEspecialista.erros['registroProfissional']).toBeTruthy();
    expect(f.infoEspecialista.erros['especialidades']).toBeTruthy();
    expect(f.infoEspecialista.erros['jornadas']).toBeTruthy();
  });

  it('aceita especialista com registro, ao menos uma especialidade e uma jornada completa', () => {
    const f = formularioValido();
    f.infoEspecialista.ehEspecialista = true;
    f.infoEspecialista.registroProfissional = 'CRM-SP 123456';
    f.infoEspecialista.especialidades = ['pediatria'];
    f.infoEspecialista.jornadas = [{ diaSemana: 1, horaInicio: '08:00', horaTermino: '17:00' }];

    expect(service.validar(f).valido).toBe(true);
  });

  it('exige CNPJ (14 dígitos) e razão social quando "atua como PJ" está marcado', () => {
    const f = formularioValido();
    f.infoEspecialista.ehEspecialista = true;
    f.infoEspecialista.registroProfissional = 'CRM-SP 123456';
    f.infoEspecialista.especialidades = ['pediatria'];
    f.infoEspecialista.jornadas = [{ diaSemana: 1, horaInicio: '08:00', horaTermino: '17:00' }];
    f.infoEspecialista.atuaComoPJ = true;
    f.infoEspecialista.cnpj = '123';
    f.infoEspecialista.razaoSocial = '';

    const resultado = service.validar(f);

    expect(resultado.valido).toBe(false);
    expect(f.infoEspecialista.erros['cnpj']).toContain('14 dígitos');
    expect(f.infoEspecialista.erros['razaoSocial']).toBeTruthy();
  });

  it('jornadasCompletas() ignora linhas parcialmente preenchidas', () => {
    const f = formularioValido();
    f.infoEspecialista.jornadas = [
      { diaSemana: 1, horaInicio: '08:00', horaTermino: '' },
      { diaSemana: 2, horaInicio: '08:00', horaTermino: '12:00' },
    ];

    expect(service.jornadasCompletas(f).length).toBe(1);
  });
});