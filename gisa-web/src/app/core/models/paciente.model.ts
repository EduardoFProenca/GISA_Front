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

// Item da busca GET /pacientes?termo= (até 20, sem paginação), de GET /assistentes-sociais/me/pacientes
// e dos pacientes de um assistente social. O CPF completo só sai no detalhe (LGPD).
export interface PacienteResumo {
  idCadastro: number;
  nome: string;
  cpfMascarado: string;
  statusCadastro: StatusCadastro;
}

// DELETE /pacientes/{id}: terapias futuras afetadas pela inativação.
export interface InativacaoPacienteResponse {
  terapiasCanceladas: number;
  terapiasColetivasRemovido: number;
}

// Responsável dentro do detalhe do paciente. `responsavel.idCadastro` = idResponsavel.
export interface VinculoResponsavel {
  responsavel: Pessoa;
  ocupacao: string | null;
  grauParentesco: GrauParentesco;
  // true: a API mantém os endereços do responsável iguais aos do paciente.
  resideComPaciente: boolean;
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
  // Vínculos ativos, por nome.
  assistentesSociais: { idCadastro: number; nome: string }[];
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
// naoResideComPaciente = false: fica com os endereços do paciente (enderecos é ignorado). Um responsável
// já cadastrado com outro endereço não pode residir (400).
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
  // Opcional (lista vazia = sem endereço).
  enderecos: Endereco[];
  idEscola?: number;
  convenio?: boolean;
  // CIDs que já existem na base.
  codigosCid: string[];
  // CIDs novos, cadastrados junto com o paciente.
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
  // Endereço cadastrado não pode ser removido ([] é recusado), só alterado. Os responsáveis com
  // resideComPaciente = true vão junto para o novo endereço.
  enderecos?: Endereco[];
  // Substitui a lista: CIDs que já existem vão em codigosCid; os que ainda não existem, em novosCids.
  codigosCid?: string[];
  novosCids?: Cid[];
  // Atualiza só os campos enviados; null remove o prontuário.
  prontuario?: Prontuario | null;
  // Responsável que não vier na lista é desvinculado (ao menos 1).
  responsaveis?: { idResponsavel: number; grauParentesco: GrauParentesco; resideComPaciente?: boolean }[];
}

// PATCH /responsaveis/{id} (vínculo, grau de parentesco e residência mudam no PATCH do paciente).
// Mudar o endereço aqui tira a residência dos pacientes que ficaram no endereço antigo.
export interface AtualizacaoResponsavelPayload {
  nome?: string;
  celular?: string | null;
  numCNS?: string | null;
  ocupacao?: string | null;
  estadoCivil?: EstadoCivil;
  statusCadastro?: StatusCadastro;
  enderecos?: Endereco[];
}
