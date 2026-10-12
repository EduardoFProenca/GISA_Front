import { Cid, GrauParentesco, StatusPaciente, TipoEscola } from './paciente.model';
import { PacienteCadastroPayload } from './paciente-cadastro.model';

export interface EnderecoDetalhe {
  cep: string;
  endereco: string; // rua
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface ResponsavelDetalhe {
  nome: string;
  cpf: string;
  celular: string | null;
  grauParentesco: GrauParentesco;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  ocupacao: string;
  naoResideComPaciente: boolean;
  endereco: EnderecoDetalhe | null; // só quando não reside com o paciente
}

export interface EscolaDetalhe {
  idEscola: number;
  nome: string;
  tipoEscola: TipoEscola;
  telefone: string | null;
}

// Ficha completa do paciente (telas de detalhe e edição). ATENÇÃO: a documentação da API ainda
// não tem GET /pacientes/{id}; este formato espelha o cadastro (POST /pacientes) e pode mudar.
export interface PacienteDetalhe {
  idCadastro: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  celular: string | null;
  numCNS: string | null;
  statusPaciente: StatusPaciente;
  convenio: boolean;
  endereco: EnderecoDetalhe;
  escola: EscolaDetalhe | null;
  responsaveis: ResponsavelDetalhe[];
  prontuario: { alergias: string; comorbidade: string; mobilidade: string };
  cids: Cid[];
}

// Corpo da edição (PUT /pacientes/{id}). ATENÇÃO: endpoint ainda não documentado na API;
// formato assumido a partir do cadastro. CPF, sexo e data de nascimento não são editáveis.
// idEscola = null remove a escola do paciente.
export type PacienteEdicaoPayload = Omit<PacienteCadastroPayload, 'cpf' | 'sexo' | 'dataNascimento' | 'idEscola'> & {
  idEscola: number | null;
  statusPaciente: StatusPaciente;
};
