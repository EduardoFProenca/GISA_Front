// Conversões entre as respostas da API de pacientes e os valores dos formulários.
import { Endereco, Pessoa } from '../../core/models/comum.model';
import { Paciente, VinculoResponsavel } from '../../core/models/paciente.model';
import { DadosPessoaisValor } from '../../shared/components/dados-pessoais/dados-pessoais';
import { formatarCelular, formatarCep, formatarCpf } from '../../shared/utils/formatacao.util';
import { EnderecoForm, ResponsavelItem } from './cadastrar-paciente/models/formularios-paciente';

export function enderecoParaForm(e: Endereco | null | undefined): EnderecoForm {
  return {
    cep: formatarCep(e?.cep),
    endereco: e?.rua ?? '',
    numero: e?.numero ?? '',
    complemento: e?.complemento ?? '',
    bairro: e?.bairro ?? '',
    cidade: e?.cidade ?? '',
    uf: e?.estado ?? '',
  };
}

export function dadosPessoaisDe(p: Pessoa): Partial<DadosPessoaisValor> {
  return {
    nome: p.nome,
    cpf: formatarCpf(p.cpf),
    email: '',
    dataNascimento: p.dataNascimento,
    sexo: p.sexo,
    celular: formatarCelular(p.celular),
    estadoCivil: p.estadoCivil,
    numCNS: p.numCNS ?? '',
  };
}

function mesmoEndereco(a: Endereco | undefined, b: Endereco | undefined): boolean {
  if (!a || !b) return false;
  const chave = (e: Endereco) =>
    [e.cep, e.rua, e.numero, e.complemento ?? '', e.bairro, e.cidade, e.estado].join('|').toLowerCase();
  return chave(a) === chave(b);
}

// A API não guarda "reside com o paciente": deduz pelo endereço (quem reside recebeu o do paciente).
export function responsavelParaForm(v: VinculoResponsavel, paciente: Paciente): ResponsavelItem {
  const r = v.responsavel;
  const endereco = r.enderecos[0];
  const reside = !endereco || mesmoEndereco(endereco, paciente.pessoa.enderecos[0]);
  return {
    idResponsavel: r.idCadastro,
    nome: r.nome,
    cpf: formatarCpf(r.cpf),
    dataNascimento: r.dataNascimento,
    sexo: r.sexo,
    estadoCivil: r.estadoCivil,
    celular: formatarCelular(r.celular),
    ocupacao: v.ocupacao ?? '',
    grauParentesco: v.grauParentesco,
    naoResideComPaciente: !reside,
    endereco: reside ? null : enderecoParaForm(endereco),
  };
}
