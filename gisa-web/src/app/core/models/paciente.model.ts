// Pacientes e responsáveis (ver PACIENTES.md).
import { Endereco, EstadoCivil, Pessoa, Sexo, StatusCadastro } from './comum.model';
import { Cid } from './cid.model';
import { Escola } from './escola.model';

export type StatusPaciente = 'MATRICULADO' | 'ALTA' | 'DESLIGADO';

export type GrauParentesco = 'PAI' | 'MAE' | 'AVO' | 'TUTOR_LEGAL' | 'OUTRO';

export interface Prontuario {
  alergias?: string | null;
  comorbidade?: string | null;
  mobilidade?: string | null;
}

// ---------- Respostas ----------

// Item de GET /pacientes (idade calculada pelo back; CPF sem máscara).
export interface PacienteResumo {
  idCadastro: number;
  nome: string;
  idade: number;
  cpf: string;
  responsaveis: {
    nome: string;
    celular: string | null;
    grauParentesco: GrauParentesco;
  }[];
  cids: Cid[];
  statusPaciente: StatusPaciente;
}

// Responsável dentro do detalhe do paciente. `responsavel.idCadastro` = idResponsavel.
export interface VinculoResponsavel {
  responsavel: Pessoa;
  ocupacao: string | null;
  grauParentesco: GrauParentesco;
}

// GET /pacientes/{id} (também é a resposta do PATCH e do POST .../responsaveis).
export interface Paciente {
  pessoa: Pessoa;
  statusPaciente: StatusPaciente;
  dataCadastro: string;
  convenio: boolean | null;
  escola: Escola | null;
  cids: Cid[];
  prontuario: Prontuario | null;
  responsaveis: VinculoResponsavel[];
}

// Item de GET /responsaveis.
export interface ResponsavelResumo {
  idCadastro: number;
  nome: string;
  cpf: string;
  celular: string | null;
  ocupacao: string | null;
  statusCadastro: StatusCadastro;
}

// GET /responsaveis/{id}
export interface Responsavel {
  pessoa: Pessoa;
  ocupacao: string | null;
}

export interface CadastroPacienteResponse {
  idCadastro: number;
  nome: string;
  cpf: string;
  statusPaciente: StatusPaciente;
  dataCadastro: string;
}

// ---------- Cadastro (POST) ----------

// Item de `responsaveis` no POST /pacientes e corpo do POST /pacientes/{id}/responsaveis.
// naoResideComPaciente = false: recebe os endereços do paciente (enderecos é ignorado).
export interface ResponsavelPayload {
  idResponsavel?: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: Sexo;
  estadoCivil: EstadoCivil;
  celular?: string;
  numCNS?: string;
  ocupacao?: string;
  grauParentesco: GrauParentesco;
  naoResideComPaciente: boolean;
  enderecos?: Endereco[];
}

// Corpo do POST /pacientes (statusPaciente e dataCadastro são definidos pelo back).
export interface PacienteCadastroPayload {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: Sexo;
  estadoCivil: EstadoCivil;
  celular?: string;
  numCNS?: string;
  enderecos: Endereco[];
  idEscola?: number;
  convenio?: boolean;
  // CIDs que já existem na base.
  codigosCid: string[];
  // CIDs novos, cadastrados junto com o paciente (só no POST).
  novosCids: Cid[];
  prontuario: Prontuario;
  responsaveis: ResponsavelPayload[];
}

// ---------- Atualização (PATCH) ----------
// Envie só o que mudar; listas substituem as atuais. cpf, dataNascimento, sexo e
// dataCadastro são somente leitura (ignorados pela API).

export interface AtualizacaoPacientePayload {
  nome?: string;
  celular?: string | null;
  numCNS?: string | null;
  estadoCivil?: EstadoCivil;
  statusCadastro?: StatusCadastro;
  statusPaciente?: StatusPaciente;
  convenio?: boolean | null;
  // null remove a escola do paciente.
  idEscola?: number | null;
  enderecos?: Endereco[];
  // Só CIDs já existentes (novosCids não existe no PATCH).
  codigosCid?: string[];
  // Atualiza só os campos enviados; null remove o prontuário.
  prontuario?: Prontuario | null;
  // Responsável que não vier na lista é desvinculado (ao menos 1).
  responsaveis?: { idResponsavel: number; grauParentesco: GrauParentesco }[];
}

// PATCH /responsaveis/{id} (vínculo e grau de parentesco mudam no PATCH do paciente).
export interface AtualizacaoResponsavelPayload {
  nome?: string;
  celular?: string | null;
  numCNS?: string | null;
  ocupacao?: string | null;
  estadoCivil?: EstadoCivil;
  statusCadastro?: StatusCadastro;
  enderecos?: Endereco[];
}
