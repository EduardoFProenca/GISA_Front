// Profissionais, especialistas e especialistas PJ (ver PROFISSIONAIS.md e ESPECIALISTAS.md).
import { Endereco, EstadoCivil, ParametrosPagina, Pessoa, Sexo, StatusCadastro } from './comum.model';
import { Cargo } from './cargo.model';
import { Especialidade, NovaEspecialidade } from './especialidade.model';
import { PerfilResumo, Permissao } from './perfil.model';

// ---------- Respostas ----------

export type TipoProfissional = 'PROFISSIONAL' | 'ESPECIALISTA' | 'ESPECIALISTA_PJ';

// Item de GET /profissionais (inclui especialistas e PJ). `idProfissional` = idCadastro.
export interface ProfissionalResumo {
  idProfissional: number;
  nome: string;
  nomeCargo: string;
  registroConselho: string | null;
  statusCadastro: StatusCadastro;
  tipo: TipoProfissional;
}

// Filtros de GET /profissionais. `tipo` é exato: ESPECIALISTA não inclui os PJ.
export interface FiltroProfissionais extends ParametrosPagina {
  cpf?: string;
  nome?: string;
  tipo?: TipoProfissional[];
  statusCadastro?: StatusCadastro;
}

// Usuário de acesso ao sistema (null quando o cadastro não tem acesso).
export interface UsuarioAcesso {
  idCadastro: number;
  perfil: PerfilResumo;
  permissoes: Permissao[];
}

// GET /profissionais/{id}
export interface Profissional {
  pessoa: Pessoa;
  email: string;
  cargo: Cargo;
  usuario: UsuarioAcesso | null;
}

// diaSemana: 1 = Segunda ... 7 = Domingo.
export interface Jornada {
  idJornada?: number;
  diaSemana: number;
  horaInicio: string;
  horaTermino: string;
}

// GET /especialistas/{id}
export interface Especialista {
  profissional: Profissional;
  registroConselho: string;
  especialidades: Especialidade[];
  jornadas: Jornada[];
}

// GET /especialistas/pj/{id}
export interface EspecialistaPJ {
  especialista: Especialista;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  inscricaoEstadual: string | null;
}

// Resultado agregado que o ProfissionalService monta com as 1 a 3 chamadas.
export interface ProfissionalDetalhe {
  profissional: Profissional;
  especialista: Especialista | null;
  pj: EspecialistaPJ | null;
}

// Resposta 201 dos cadastros (registroConselho só em especialista/PJ; cnpj e razaoSocial só em PJ).
export interface CadastroResponse {
  idCadastro: number;
  nome: string;
  cpf: string;
  email: string;
  idCargo: number;
  registroConselho?: string;
  cnpj?: string;
  razaoSocial?: string;
  acessoCriado: boolean;
}

// ---------- Cadastro (POST) ----------

export interface DadosBaseProfissional {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: Sexo;
  estadoCivil: EstadoCivil;
  celular?: string;
  numCNS?: string;
  enderecos: Endereco[];
  email: string;
  idCargo: number;
}

// Ao menos uma especialidade (existente ou nova) e ao menos uma jornada.
export interface DadosEspecialista extends DadosBaseProfissional {
  registroConselho: string;
  especialidadesIds: number[];
  novasEspecialidades: NovaEspecialidade[];
  jornadas: Jornada[];
}

export interface DadosEspecialistaPJ extends DadosEspecialista {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
}

// Bloco `usuario` dos cadastros "com acesso" e corpo de POST .../{id}/usuario (concessão de acesso).
export interface DadosUsuario {
  senha: string;
  idPerfil: number;
}

export interface ProfissionalComUsuario {
  profissional: DadosBaseProfissional;
  usuario: DadosUsuario;
}

export interface EspecialistaComUsuario {
  especialista: DadosEspecialista;
  usuario: DadosUsuario;
}

export interface EspecialistaPJComUsuario {
  especialistaPJ: DadosEspecialistaPJ;
  usuario: DadosUsuario;
}

// Resposta 201 de POST .../{id}/usuario.
export type AcessoConcedidoResponse = UsuarioAcesso;

// ---------- Atualização (PATCH) ----------
// Envie só o que mudar; listas substituem as atuais. cpf, dataNascimento, sexo,
// registroConselho e cnpj são somente leitura (ignorados pela API).

export interface AtualizacaoProfissionalPayload {
  nome?: string;
  celular?: string | null;
  numCNS?: string | null;
  estadoCivil?: EstadoCivil;
  statusCadastro?: StatusCadastro;
  enderecos?: Endereco[];
  email?: string;
  idCargo?: number;
  // Só funciona se o cadastro já tiver usuário de acesso (senão 409).
  idPerfil?: number;
}

export interface AtualizacaoEspecialistaPayload extends AtualizacaoProfissionalPayload {
  especialidadesIds?: number[];
  // Acrescenta às especialidades atuais (as demais listas substituem).
  novasEspecialidades?: NovaEspecialidade[];
  jornadas?: Jornada[];
}

export interface AtualizacaoEspecialistaPJPayload extends AtualizacaoEspecialistaPayload {
  razaoSocial?: string;
  nomeFantasia?: string | null;
  inscricaoEstadual?: string | null;
}
