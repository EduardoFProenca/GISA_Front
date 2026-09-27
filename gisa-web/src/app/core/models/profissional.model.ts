export type EstadoCivil = 'SOLTEIRO' | 'CASADO' | 'VIUVO' | 'SEPARADO' | 'DIVORCIADO';
export type Sexo = 'F' | 'M' | 'O';

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Jornada {
  diaSemana: number;
  horaInicio: string;
  horaTermino: string;
}

export interface DadosBaseProfissional {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: Sexo | string;
  celular: string;
  numCNS?: string;
  estadoCivil: EstadoCivil | string;
  enderecos: Endereco[];
  email: string;
  idCargo: number;
}

export interface NovaEspecialidade {
  nome: string;
  descricao: string;
}

export interface DadosEspecialista extends DadosBaseProfissional {
  registroConselho: string;
  especialidadesIds: number[];
  novasEspecialidades: NovaEspecialidade[];
  jornadas: Jornada[];
}

export interface DadosEspecialistaPJ extends DadosEspecialista {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
}

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

export interface CadastroResponse {
  idCadastro: number;
  nome: string;
  cpf: string;
  email: string;
  idCargo: number;
  acessoCriado: boolean;
}
