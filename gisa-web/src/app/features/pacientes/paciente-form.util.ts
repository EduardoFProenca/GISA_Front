// Conversões entre as respostas da API de pacientes e os valores dos formulários.
import { Endereco, Pessoa } from '../../core/models/comum.model';
import { Responsavel, VinculoResponsavel } from '../../core/models/paciente.model';
import { soDigitos } from '../../shared/utils/texto.util';
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

// Mesmo endereço nos formulários (ignora máscara do CEP, maiúsculas e espaços nas pontas).
export function mesmoEnderecoForm(a: EnderecoForm, b: EnderecoForm): boolean {
  const chave = (e: EnderecoForm) =>
    [soDigitos(e.cep), e.endereco, e.numero, e.complemento ?? '', e.bairro, e.cidade, e.uf]
      .map((v) => v.trim().toLowerCase())
      .join('|');
  return chave(a) === chave(b);
}

export function enderecoVazio(e: EnderecoForm): boolean {
  return [e.cep, e.endereco, e.numero, e.complemento, e.bairro, e.cidade, e.uf].every((v) => !v?.trim());
}

// "Rua das Flores, 10 (apto 2) - Centro, Sorocaba/SP"
export function enderecoEmTexto(e: EnderecoForm): string {
  const complemento = e.complemento?.trim() ? ` (${e.complemento.trim()})` : '';
  return `${e.endereco}, ${e.numero}${complemento} - ${e.bairro}, ${e.cidade}/${e.uf}`;
}

// Responsável já cadastrado (GET /responsaveis/{id}) escolhido para vincular ao paciente.
export function responsavelReaproveitado(r: Responsavel, grauParentesco: ResponsavelItem['grauParentesco']): ResponsavelItem {
  const p = r.pessoa;
  return {
    idResponsavel: p.idCadastro,
    nome: p.nome,
    cpf: formatarCpf(p.cpf),
    dataNascimento: p.dataNascimento,
    sexo: p.sexo,
    estadoCivil: p.estadoCivil,
    celular: formatarCelular(p.celular),
    ocupacao: r.ocupacao ?? '',
    grauParentesco,
    naoResideComPaciente: false,
    endereco: null,
    reaproveitado: true,
    inativo: p.statusCadastro === 'INATIVO',
    enderecoCadastro: p.enderecos[0] ? enderecoParaForm(p.enderecos[0]) : null,
  };
}

export function responsavelParaForm(v: VinculoResponsavel): ResponsavelItem {
  const r = v.responsavel;
  const endereco = r.enderecos[0];
  const reside = v.resideComPaciente;
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
    endereco: reside || !endereco ? null : enderecoParaForm(endereco),
    enderecoCadastro: endereco ? enderecoParaForm(endereco) : null,
    resideAntes: reside,
  };
}
