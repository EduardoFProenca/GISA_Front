export interface ProfissionalResumo {
  idProfissional: number;
  nome: string;
  nomeCargo: string;
  registroConselho: string | null;
  statusCadastro: string;
}

export interface PaginaSpring<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
