import { formatarCpf } from '../../../shared/utils/formatacao.util';
import { dataCurta, diasEntre, somarDias } from '../../../shared/utils/data.util';
import { vazio } from '../../../shared/utils/texto.util';

export type TipoAtestado = 'AFASTAMENTO' | 'ACOMPANHAMENTO' | 'APTIDAO_FISICA' | 'COMPARECIMENTO';

export const ROTULO_TIPO_ATESTADO: Record<TipoAtestado, string> = {
  AFASTAMENTO: 'Afastamento por doença / tratamento',
  ACOMPANHAMENTO: 'Acompanhamento do responsável',
  APTIDAO_FISICA: 'Aptidão física',
  COMPARECIMENTO: 'Comparecimento à consulta / terapia',
};

// Cabeçalho do timbrado. TODO: endereço, telefone e CNPJ oficiais da APAE Sorocaba.
export const INSTITUICAO = {
  nome: 'APAE Sorocaba',
  descricao: 'Associação de Pais e Amigos dos Excepcionais de Sorocaba',
};

export const MAX_DIAS_AFASTAMENTO = 365;

// Tipos que têm período (dias + data final). Os demais usam uma data só.
export function tipoTemPeriodo(tipo: TipoAtestado | ''): boolean {
  return tipo === 'AFASTAMENTO' || tipo === 'ACOMPANHAMENTO';
}

// Formulário da tela (como o usuário digita).
export interface FormAtestado {
  tipo: TipoAtestado | '';
  dias: number | null;
  dataInicio: string;
  dataFim: string;
  codigoCid: string | null;
  autorizouCid: boolean;
  cpfResponsavel: string;
  observacoes: string;
}

// dataFim = dataInicio + (dias - 1). Devolve '' se faltar dado.
export function calcularDataFim(dataInicio: string, dias: number | null): string {
  if (!dataInicio || dias === null || !Number.isInteger(dias) || dias < 1) return '';
  return somarDias(dataInicio, dias - 1);
}

// Quantidade de dias de um período fechado (início e fim contam). null se inválido.
export function calcularDias(dataInicio: string, dataFim: string): number | null {
  if (!dataInicio || !dataFim) return null;
  const dias = diasEntre(dataInicio, dataFim) + 1;
  return dias >= 1 ? dias : null;
}

export function validarAtestado(f: FormAtestado): Record<string, string> {
  const erros: Record<string, string> = {};

  if (!f.tipo) erros['tipo'] = 'Selecione o tipo do atestado.';
  if (vazio(f.dataInicio)) {
    erros['dataInicio'] = tipoTemPeriodo(f.tipo) ? 'Informe a data de início.' : 'Informe a data.';
  }

  if (tipoTemPeriodo(f.tipo)) {
    if (f.dias === null || !Number.isInteger(f.dias) || f.dias < 1) {
      erros['dias'] = 'Informe a quantidade de dias (mínimo 1).';
    } else if (f.dias > MAX_DIAS_AFASTAMENTO) {
      erros['dias'] = `O período não pode passar de ${MAX_DIAS_AFASTAMENTO} dias.`;
    }
    if (vazio(f.dataFim)) erros['dataFim'] = 'Informe a data final.';
    else if (!vazio(f.dataInicio) && f.dataFim < f.dataInicio) {
      erros['dataFim'] = 'A data final não pode ser anterior à data de início.';
    }
  }

  // O CID só pode constar no atestado se o paciente/responsável autorizou.
  if (f.codigoCid && !f.autorizouCid) {
    erros['autorizouCid'] = 'Confirme a autorização do paciente/responsável para informar o CID.';
  }

  if (f.tipo === 'ACOMPANHAMENTO' && vazio(f.cpfResponsavel)) {
    erros['cpfResponsavel'] = 'Selecione o responsável acompanhante.';
  }

  return erros;
}

const UNIDADES = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze',
  'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos',
  'oitocentos', 'novecentos'];

// 0 a 999 (suficiente para dias de afastamento).
export function numeroPorExtenso(n: number): string {
  if (n < 20) return UNIDADES[n];
  if (n < 100) {
    const resto = n % 10;
    return resto ? `${DEZENAS[Math.floor(n / 10)]} e ${UNIDADES[resto]}` : DEZENAS[n / 10];
  }
  if (n === 100) return 'cem';
  if (n < 1000) {
    const resto = n % 100;
    return resto ? `${CENTENAS[Math.floor(n / 100)]} e ${numeroPorExtenso(resto)}` : CENTENAS[n / 100];
  }
  return String(n);
}

export interface DadosTextoAtestado {
  form: FormAtestado;
  pacienteNome: string;
  pacienteCpf: string;
  responsavel: { nome: string; cpf: string } | null; // acompanhante escolhido, se houver
  cidTexto: string | null; // "F70 — Retardo mental leve" (já autorizado)
}

// Texto do corpo do atestado (parágrafos), em linguagem neutra quanto ao gênero.
export function textoAtestado(d: DadosTextoAtestado): string[] {
  const f = d.form;
  const paciente = `${d.pacienteNome}, CPF ${formatarCpf(d.pacienteCpf)}`;
  const periodo =
    tipoTemPeriodo(f.tipo) && f.dias
      ? `${f.dias} (${numeroPorExtenso(f.dias)}) dia${f.dias > 1 ? 's' : ''}, de ${dataCurta(f.dataInicio)} a ${dataCurta(f.dataFim)}`
      : '';
  const paragrafos: string[] = [];

  switch (f.tipo) {
    case 'AFASTAMENTO':
      paragrafos.push(
        `Atesto, para os devidos fins, que ${paciente}, necessita de afastamento de suas atividades por ${periodo}, em razão de doença/tratamento de saúde.`
      );
      break;
    case 'ACOMPANHAMENTO':
      paragrafos.push(
        `Atesto, para os devidos fins, que o(a) paciente ${paciente}, está em acompanhamento de saúde e necessita da presença de ${
          d.responsavel ? `seu(sua) responsável, ${d.responsavel.nome}, CPF ${formatarCpf(d.responsavel.cpf)},` : 'seu responsável'
        } por ${periodo}.`
      );
      break;
    case 'APTIDAO_FISICA':
      paragrafos.push(
        `Atesto, para os devidos fins, que ${paciente}, foi avaliado(a) clinicamente em ${dataCurta(f.dataInicio)} e encontra-se apto(a) para a prática de atividades físicas.`
      );
      break;
    case 'COMPARECIMENTO':
      paragrafos.push(
        `Atesto, para os devidos fins, que ${paciente}, compareceu a atendimento nesta instituição em ${dataCurta(f.dataInicio)}.`
      );
      break;
    default:
      break;
  }

  if (d.cidTexto) paragrafos.push(`CID-10: ${d.cidTexto}.`);
  if (f.observacoes.trim()) paragrafos.push(`Observações: ${f.observacoes.trim()}`);
  return paragrafos;
}
