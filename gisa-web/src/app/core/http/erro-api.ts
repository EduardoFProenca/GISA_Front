import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { ErroApi } from '../models/comum.model';

// Tratamento do corpo de erro padrão da API (ver 00-GERAL.md, "Formato de erro"):
// se `fields` tiver itens, cada mensagem vai no campo correspondente; se estiver vazio,
// `message` é o aviso geral.

export const MSG_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
export const MSG_SESSAO_EXPIRADA = 'Sua sessão expirou. Faça login novamente.';
export const MSG_TEMPO_ESGOTADO = 'O servidor demorou para responder. Tente novamente em instantes.';
export const MSG_CORRIJA_CAMPOS = 'Corrija os campos destacados em vermelho.';

export function lerErroApi(err: unknown): ErroApi | null {
  const corpo = err instanceof HttpErrorResponse ? err.error : null;
  return corpo && typeof corpo === 'object' && ('message' in corpo || 'fields' in corpo)
    ? (corpo as ErroApi)
    : null;
}

// Último trecho da chave, sem índices: 'responsaveis[1].enderecos[0].cep' -> 'cep'.
export function campoDaChave(chave: string): string {
  return chave.split('.').pop()!.replace(/\[\d+\]/g, '');
}

// Mensagem para exibir como aviso geral.
export function mensagemDeErro(err: unknown, padrao = 'Não foi possível concluir a operação.'): string {
  if (err instanceof TimeoutError) return MSG_TEMPO_ESGOTADO;
  if (!(err instanceof HttpErrorResponse)) return padrao;
  // status 0: a requisição nem chegou (offline, CORS ou bloqueador do navegador).
  if (err.status === 0) return MSG_SEM_CONEXAO;
  if (err.status === 401) return MSG_SESSAO_EXPIRADA;
  return lerErroApi(err)?.message || padrao;
}

export interface ResultadoErroApi {
  mensagemGeral: string;
  algumCampoMarcado: boolean;
}

export interface OpcoesErroApi {
  // Mensagem quando a API não manda `message`.
  padrao?: string;
  // Regras de negócio chegam só em `message` (fields vazio); permite destacar o campo mesmo assim.
  marcarPorMensagem?: (mensagem: string) => boolean;
}

// Distribui os erros da API pelos campos do formulário. `marcar` recebe a chave original
// (ex.: 'enderecos[0].cep') e devolve true se encontrou onde exibir a mensagem.
export function aplicarErrosApi(
  err: unknown,
  marcar: (chave: string, mensagem: string) => boolean,
  opcoes: OpcoesErroApi = {}
): ResultadoErroApi {
  const corpo = lerErroApi(err);
  if (!corpo) return { mensagemGeral: mensagemDeErro(err, opcoes.padrao), algumCampoMarcado: false };

  const semDestino: string[] = [];
  let mapeados = 0;

  for (const [chave, mensagem] of Object.entries(corpo.fields ?? {})) {
    if (marcar(chave, mensagem)) mapeados++;
    else semDestino.push(mensagem);
  }

  if (mapeados === 0 && semDestino.length === 0 && corpo.message && opcoes.marcarPorMensagem?.(corpo.message)) {
    mapeados++;
  }

  let mensagemGeral = mapeados > 0 ? MSG_CORRIJA_CAMPOS : corpo.message || opcoes.padrao || 'Erro ao salvar.';
  if (semDestino.length) mensagemGeral += ' ' + semDestino.join(' ');

  return { mensagemGeral, algumCampoMarcado: mapeados > 0 };
}
