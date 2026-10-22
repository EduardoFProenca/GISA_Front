// Tipos comuns a todos os módulos da API (ver 00-GERAL.md).

export type EstadoCivil = 'SOLTEIRO' | 'CASADO' | 'VIUVO' | 'SEPARADO' | 'DIVORCIADO';
export type Sexo = 'F' | 'M' | 'O';
export type StatusCadastro = 'ATIVO' | 'INATIVO';

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
}

// Bloco "pessoa" das respostas de detalhe (paciente, responsável, profissional...).
export interface Pessoa {
  idCadastro: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: Sexo;
  celular: string | null;
  numCNS: string | null;
  estadoCivil: EstadoCivil;
  statusCadastro: StatusCadastro;
  enderecos: Endereco[];
}

// Pessoa vinculada a outro registro (profissionais de um cargo, usuários de um perfil).
export interface CadastroVinculado {
  idCadastro: number;
  nome: string;
  cpf: string;
  statusCadastro: StatusCadastro;
}

// ---------- Paginação ----------

// Formato da resposta paginada da API: os totais vêm dentro de `page`.
export interface PaginaApi<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

// Formato usado pelas telas (totais no nível de cima).
export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export function normalizarPagina<T>(resposta: PaginaApi<T>): Pagina<T> {
  const content = resposta.content ?? [];
  const p = resposta.page;
  return {
    content,
    totalElements: p?.totalElements ?? content.length,
    totalPages: p?.totalPages ?? 1,
    number: p?.number ?? 0,
    size: p?.size ?? content.length,
  };
}

// Parâmetros comuns das listagens paginadas (page começa em 0; sort ex.: 'nome,asc').
export interface ParametrosPagina {
  page?: number;
  size?: number;
  sort?: string;
}

// ---------- Erro ----------

// Corpo padrão de todo erro da API. Se `fields` tiver itens, cada mensagem vai no campo
// correspondente; se estiver vazio, `message` é o aviso geral.
export interface ErroApi {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fields: Record<string, string>;
  // 409 na alteração de jornada: terapias agendadas que ficariam fora do novo horário.
  terapias?: TerapiaForaDaJornada[];
}

export interface TerapiaForaDaJornada {
  idTerapia: number;
  data: string;
  horaInicio: string;
  horaTermino: string;
}
