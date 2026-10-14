import { dataCurta, hojeIso } from '../../../shared/utils/data.util';
import { formatarCpf } from '../../../shared/utils/formatacao.util';

// Documentos que o especialista emite. O texto é livre; nada é salvo na API.
export type TipoDocumentoClinico = 'ATESTADO' | 'RECEITA';

export const TITULO_DOCUMENTO: Record<TipoDocumentoClinico, string> = {
  ATESTADO: 'Atestado',
  RECEITA: 'Receita',
};

export interface ContextoModelo {
  pacienteNome: string;
  pacienteCpf: string;
  // Primeiro responsável do paciente, se houver (modelo de acompanhamento).
  responsavelNome: string | null;
}

export interface ModeloTexto {
  id: string;
  rotulo: string;
  texto: (c: ContextoModelo) => string;
}

// Pontos de partida opcionais: preenchem o texto, que o especialista edita à vontade.
// Os "___" marcam o que ele precisa completar.
export const MODELOS_ATESTADO: ModeloTexto[] = [
  {
    id: 'comparecimento',
    rotulo: 'Comparecimento',
    texto: (c) =>
      `Atesto, para os devidos fins, que ${identificar(c)} compareceu a atendimento nesta instituição em ${dataCurta(hojeIso())}, das ___ às ___.`,
  },
  {
    id: 'afastamento',
    rotulo: 'Afastamento',
    texto: (c) =>
      `Atesto, para os devidos fins, que ${identificar(c)} necessita de afastamento de suas atividades por ___ (___) dias, a partir de ${dataCurta(hojeIso())}, em razão de tratamento de saúde.`,
  },
  {
    id: 'acompanhamento',
    rotulo: 'Acompanhamento do responsável',
    texto: (c) =>
      `Atesto, para os devidos fins, que ${c.responsavelNome ?? '___'} acompanhou ${identificar(c)} em atendimento nesta instituição em ${dataCurta(hojeIso())}, das ___ às ___.`,
  },
  {
    id: 'aptidao',
    rotulo: 'Aptidão física',
    texto: (c) =>
      `Atesto, para os devidos fins, que ${identificar(c)} foi avaliado(a) em ${dataCurta(hojeIso())} e encontra-se apto(a) para a prática de atividades físicas.`,
  },
];

function identificar(c: ContextoModelo): string {
  return `${c.pacienteNome}, CPF ${formatarCpf(c.pacienteCpf)},`;
}
