import { Profissional, ProfissionalDetalhe } from '../../../core/models/profissional.model';
import {
  formatarCelular,
  formatarCpf,
  paraFormularios,
} from './profissional-detalhe.util';

const profissional: Profissional = {
  pessoa: {
    idCadastro: 7,
    nome: 'Roberto Almeida',
    cpf: '12345678900',
    dataNascimento: '1985-04-12',
    sexo: 'M',
    celular: '11988887777',
    numCNS: null,
    estadoCivil: 'CASADO',
    statusCadastro: 'INATIVO' as const,
    enderecos: [
      {
        cep: '01001000',
        rua: 'Praça da Sé',
        numero: '100',
        complemento: null,
        bairro: 'Sé',
        cidade: 'São Paulo',
        estado: 'SP',
      },
    ],
  },
  email: 'roberto@apae.org',
  cargo: { idCargo: 2, nome: 'Médico', codigoCBO: '225125', tituloCBO: 'Médico clínico' },
  usuario: null,
};

describe('profissional-detalhe.util', () => {


  it('formata CPF e celular', () => {
    expect(formatarCpf('12345678900')).toBe('123.456.789-00');
    expect(formatarCelular('11988887777')).toBe('(11) 98888-7777');
    expect(formatarCelular('1188887777')).toBe('(11) 8888-7777');
  });

  it('mapeia profissional que não é especialista', () => {
    const f = paraFormularios({ profissional, especialista: null, pj: null });
    expect(f.status).toBe('INATIVO');
    expect(f.dadosPessoais['cpf']).toBe('123.456.789-00');
    expect(f.contato['cep']).toBe('01001-000');
    expect(f.contato['uf']).toBe('SP');
    expect(f.infoProfissional['cargo']).toBe('2');
    expect(f.infoEspecialista['ehEspecialista']).toBe(false);
  });

  it('mapeia especialista PJ com especialidades e jornadas', () => {
    const detalhe: ProfissionalDetalhe = {
      profissional,
      especialista: {
        profissional,
        registroConselho: 'CRM 123456',
        especialidades: [{ idEspecialidade: 1, nome: 'Clínica Geral', descricao: null }],
        jornadas: [{ idJornada: 1, diaSemana: 2, horaInicio: '08:00:00', horaTermino: '12:00' }],
      },
      pj: {
        especialista: {} as never,
        cnpj: '12345678000190',
        razaoSocial: 'Roberto LTDA',
        nomeFantasia: 'Dr. Roberto',
        inscricaoEstadual: '123',
      },
    };
    const f = paraFormularios(detalhe);
    const e = f.infoEspecialista;
    expect(e['ehEspecialista']).toBe(true);
    expect(e['atuaComoPJ']).toBe(true);
    expect(e['cnpj']).toBe('12.345.678/0001-90');
    expect(e['especialidades']).toEqual(['1']);
    expect(e['jornadas']).toEqual([{ diaSemana: 2, horaInicio: '08:00', horaTermino: '12:00' }]);
  });
});