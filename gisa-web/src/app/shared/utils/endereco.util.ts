// Funções de endereço compartilhadas entre as telas (paciente, responsável, profissional).
import { Endereco } from '../../core/models/comum.model';
import { formatarCep } from './formatacao.util';
import { soDigitos } from './texto.util';

export interface EnderecoForm {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface EnderecoItem extends EnderecoForm {
  idEndereco?: number; // vem da API (edição); ausente = endereço novo
  chave: string; // identificador local estável: `id-12` ou `novo-<contador>`
  // Resposta ao 409 de endereço compartilhado: true = vale para todos; false = só para este cadastro.
  alterarParaTodos?: boolean;
}

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

export function enderecoParaApi(e: EnderecoItem): Endereco & { alterarParaTodos?: boolean } {
  return {
    idEndereco: e.idEndereco,
    // Só vai no reenvio depois da pergunta; ausente, a API pergunta de novo (409) se a linha for compartilhada.
    alterarParaTodos: e.alterarParaTodos,
    cep: soDigitos(e.cep),
    rua: e.endereco.trim(),
    numero: e.numero.trim(),
    complemento: e.complemento?.trim() || undefined,
    bairro: e.bairro.trim(),
    cidade: e.cidade.trim(),
    estado: e.uf,
  };
}
