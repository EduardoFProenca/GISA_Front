import { Endereco } from './profissional.model';
import { GrauParentesco, StatusPaciente } from './paciente.model';

export interface ProntuarioPayload {
  alergias?: string;
  comorbidade?: string;
  mobilidade?: string;
}

export interface NovoCidPayload {
  codigoCID: string;
  descricao: string;
}

export interface ResponsavelPayload {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  celular?: string;
  ocupacao?: string;
  grauParentesco: GrauParentesco;
  naoResideComPaciente: boolean;
  enderecos?: Endereco[];
}

// Corpo do POST /api/pacientes (statusPaciente e dataCadastro são definidos pelo back).
export interface PacienteCadastroPayload {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  celular?: string;
  numCNS?: string;
  enderecos: Endereco[];
  idEscola?: number;
  convenio: boolean;
  codigosCid: string[];
  novosCids: NovoCidPayload[];
  prontuario: ProntuarioPayload;
  responsaveis: ResponsavelPayload[];
}

export interface CadastroPacienteResponse {
  idCadastro: number;
  nome: string;
  cpf: string;
  statusPaciente: StatusPaciente;
  dataCadastro: string;
}
