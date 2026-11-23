// Conversões entre as respostas da API de pacientes e os valores dos formulários.
import { Endereco, Pessoa } from '../../core/models/comum.model';
import { Responsavel, VinculoResponsavel } from '../../core/models/paciente.model';
import { soDigitos } from '../../shared/utils/texto.util';
import { DadosPessoaisValor } from '../../shared/components/dados-pessoais/dados-pessoais';
import { formatarCelular, formatarCpf } from '../../shared/utils/formatacao.util';
import { ResponsavelItem } from './cadastrar-paciente/models/formularios-paciente';
import { EnderecoItem, enderecoParaForm, mesmoEnderecoForm } from '../../shared/utils/endereco.util';

// Reexportadas para não quebrar quem importa daqui; a implementação mora em endereco.util.
export {
  enderecoEmTexto,
  enderecoParaForm,
  enderecoVazio,
  mesmoEnderecoForm,
} from '../../shared/utils/endereco.util';

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
    residencia: [],
    endereco: null,
    reaproveitado: true,
    inativo: p.statusCadastro === 'INATIVO',
    enderecoCadastro: p.enderecos[0] ? enderecoParaForm(p.enderecos[0]) : null,
  };
}

export function responsavelParaForm(v: VinculoResponsavel): ResponsavelItem {
  const r = v.responsavel;
  const endereco = r.enderecos[0];
  // Lista vazia = não reside (a escolha por endereço vem na B2).
  const reside = (v.idsEnderecoResidencia ?? []).length > 0;
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
    // Mesma chave que a lista de endereços dá aos itens vindos da API.
    residencia: (v.idsEnderecoResidencia ?? []).map((id) => `id-${id}`),
    endereco: reside || !endereco ? null : enderecoParaForm(endereco),
    enderecoCadastro: endereco ? enderecoParaForm(endereco) : null,
    resideAntes: reside,
  };
}

// Acerta a residência depois de mudar a lista de endereços ou a de responsáveis. Com 2 ou mais
// endereços não adivinha nada: quem ficou sem endereço é cobrado na validação (pais separados).
export function ajustarResidencia(responsaveis: ResponsavelItem[], enderecos: EnderecoItem[]): void {
  const existentes = new Set(enderecos.map((e) => e.chave));
  for (const r of responsaveis) {
    const restantes = (r.residencia ?? []).filter((c) => existentes.has(c));
    if (r.naoResideComPaciente || enderecos.length === 0) r.residencia = [];
    else if (enderecos.length === 1) r.residencia = [enderecos[0].chave];
    else r.residencia = restantes;
  }
}

// Pré-marcação ao confirmar um responsável com 2 ou mais endereços na lista: o endereço dele, se for um
// do paciente; senão os endereços em que ninguém mora ainda. O usuário corrige nos checkboxes.
export function sugerirResidencia(r: ResponsavelItem, outros: ResponsavelItem[], enderecos: EnderecoItem[]): string[] {
  const dele = r.enderecoCadastro ? enderecos.find((e) => mesmoEnderecoForm(e, r.enderecoCadastro!)) : undefined;
  if (dele) return [dele.chave];
  const ocupados = new Set(outros.filter((o) => !o.naoResideComPaciente).flatMap((o) => o.residencia ?? []));
  return enderecos.filter((e) => !ocupados.has(e.chave)).map((e) => e.chave);
}
