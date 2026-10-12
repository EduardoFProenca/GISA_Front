import { Cid, GrauParentesco, StatusPaciente, TipoEscola } from './paciente.model';
import { Endereco } from './profissional.model';

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
}

export interface EscolaDetalhe {
  nome: string;
  tipoEscola: TipoEscola;
  telefone: string | null;
}

// Ficha completa do paciente (tela de detalhe). ATENÇÃO: a documentação da API ainda não tem
// GET /pacientes/{id}; este formato espelha o cadastro (POST /pacientes) e pode mudar.
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
export interface PacienteEdicaoPayload {
  nome: string;
  estadoCivil: string;
  celular?: string;
  numCNS?: string;
  statusPaciente: StatusPaciente;
  enderecos: Endereco[];
}
