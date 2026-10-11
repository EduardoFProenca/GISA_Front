export interface ProfissionalResumo {
  idProfissional: number;
  nome: string;
  nomeCargo: string;
  registroConselho: string | null;
  statusCadastro: string;
}

// Formato usado pelas telas.
export interface PaginaSpring<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Formato real da API (PageSerializationMode.VIA_DTO): totais dentro de `page`.
// Também aceita o formato antigo, com os totais no nível de cima.
export interface PaginaApi<T> {
  content: T[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

export function normalizarPagina<T>(resposta: PaginaApi<T>): PaginaSpring<T> {
  const content = resposta.content ?? [];
  const p = resposta.page;
  return {
    content,
    totalElements: p?.totalElements ?? resposta.totalElements ?? content.length,
    totalPages: p?.totalPages ?? resposta.totalPages ?? 1,
    number: p?.number ?? resposta.number ?? 0,
    size: p?.size ?? resposta.size ?? content.length,
  };
}