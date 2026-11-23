import { EnderecoItem } from '../../shared/utils/endereco.util';
import { ResponsavelItem } from './cadastrar-paciente/models/formularios-paciente';
import { ajustarResidencia, responsavelParaForm, sugerirResidencia } from './paciente-form.util';

function endereco(chave: string, rua: string, numero: string): EnderecoItem {
  return { chave, cep: '18000-000', endereco: rua, numero, complemento: '', bairro: 'Centro', cidade: 'Sorocaba', uf: 'SP' };
}

const A1 = endereco('a1', 'Rua A', '10');
const A2 = endereco('a2', 'Rua B', '20');
const A3 = endereco('a3', 'Rua C', '30');

function resp(nome: string, residencia: string[], naoReside = false): ResponsavelItem {
  return {
    nome, cpf: nome, dataNascimento: '1980-01-01', sexo: 'F', estadoCivil: 'CASADO', celular: '', ocupacao: '',
    grauParentesco: 'MAE', naoResideComPaciente: naoReside, residencia, endereco: null,
  };
}

describe('ajustarResidencia', () => {
  it('tira as chaves que não existem mais', () => {
    const r = [resp('Mãe', ['a1', 'x']), resp('Pai', ['a2', 'a3'])];
    ajustarResidencia(r, [A1, A2]);
    expect(r.map((x) => x.residencia)).toEqual([['a1'], ['a2']]);
  });

  it('0 endereços: todos ficam com []', () => {
    const r = [resp('Mãe', ['a1']), resp('Pai', [])];
    ajustarResidencia(r, []);
    expect(r.map((x) => x.residencia)).toEqual([[], []]);
  });

  it('1 endereço: todos os que residem moram nele; quem não reside fica com []', () => {
    const r = [resp('Mãe', []), resp('Pai', ['a2']), resp('Avó', ['a1'], true)];
    ajustarResidencia(r, [A1]);
    expect(r.map((x) => x.residencia)).toEqual([['a1'], ['a1'], []]);
  });

  it('2 ou mais: não coloca ninguém no endereço novo', () => {
    const r = [resp('Mãe', ['a1']), resp('Pai', ['a1'])];
    ajustarResidencia(r, [A1, A2]);
    expect(r.map((x) => x.residencia)).toEqual([['a1'], ['a1']]);
  });

  it('2 ou mais e alguém sem nenhum: continua sem (a validação cobra)', () => {
    const r = [resp('Mãe', ['a1']), resp('Pai', ['x'])];
    ajustarResidencia(r, [A1, A2]);
    expect(r[1].residencia).toEqual([]);
  });
});

describe('sugerirResidencia', () => {
  it('cadastro existente com endereço igual a um do paciente: marca esse', () => {
    const r = { ...resp('Pai', []), enderecoCadastro: { ...A2, cep: '18000000', endereco: 'rua b' } };
    expect(sugerirResidencia(r, [resp('Mãe', ['a2'])], [A1, A2])).toEqual(['a2']);
  });

  it('senão: os endereços em que nenhum outro responsável mora', () => {
    expect(sugerirResidencia(resp('Pai', []), [resp('Mãe', ['a1'])], [A1, A2, A3])).toEqual(['a2', 'a3']);
  });

  it('quem não reside não ocupa endereço', () => {
    expect(sugerirResidencia(resp('Pai', []), [resp('Avó', ['a1'], true)], [A1, A2])).toEqual(['a1', 'a2']);
  });

  it('todos já têm alguém: nenhum marcado', () => {
    expect(sugerirResidencia(resp('Pai', []), [resp('Mãe', ['a1', 'a2'])], [A1, A2])).toEqual([]);
  });
});

describe('responsavelParaForm: residência', () => {
  const pessoa = {
    idCadastro: 7, nome: 'Mãe', cpf: '12345678909', dataNascimento: '1985-01-01', sexo: 'F' as const, celular: null,
    numCNS: null, estadoCivil: 'CASADO' as const, statusCadastro: 'ATIVO' as const, enderecos: [],
  };

  it('monta residencia com as chaves id-… e reside quando a lista não está vazia', () => {
    const r = responsavelParaForm({
      responsavel: pessoa, ocupacao: null, grauParentesco: 'MAE', resideComPaciente: true, idsEnderecoResidencia: [12, 15],
    });
    expect(r.residencia).toEqual(['id-12', 'id-15']);
    expect(r.naoResideComPaciente).toBe(false);
  });

  it('lista vazia = não reside', () => {
    const r = responsavelParaForm({
      responsavel: pessoa, ocupacao: null, grauParentesco: 'MAE', resideComPaciente: false, idsEnderecoResidencia: [],
    });
    expect(r.residencia).toEqual([]);
    expect(r.naoResideComPaciente).toBe(true);
  });
});
