// Tipos das respostas de GET /profissionais/{id}, /especialistas/{id} e /especialistas/pj/{id}.

export interface EnderecoApi {
  cep: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface PessoaApi {
  idCadastro: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  celular: string | null;
  numCNS: string | null;
  estadoCivil: string | null;
  statusCadastro: 'ATIVO' | 'INATIVO';
  enderecos: EnderecoApi[];
}

export interface CargoApi {
  idCargo: number;
  nome: string;
  codigoCBO: string | null;
  tituloCBO: string | null;
}

export interface ProfissionalApi {
  pessoa: PessoaApi;
  email: string | null;
  cargo: CargoApi | null;
}

export interface EspecialidadeApi {
  idEspecialidade: number;
  nome: string;
  descricao: string | null;
}

export interface JornadaApi {
  idJornada: number | null;
  diaSemana: number;
  horaInicio: string;
  horaTermino: string;
}

export interface EspecialistaApi {
  profissional: ProfissionalApi;
  registroConselho: string;
  especialidades: EspecialidadeApi[];
  jornadas: JornadaApi[];
}

export interface EspecialistaPJApi {
  especialista: EspecialistaApi;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
}

// Resultado agregado que o ProfissionalService monta com as 1 a 3 chamadas.
export interface ProfissionalDetalhe {
  profissional: ProfissionalApi;
  especialista: EspecialistaApi | null;
  pj: EspecialistaPJApi | null;
}