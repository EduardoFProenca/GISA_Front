export enum StatusPaciente {
  DESLIGADO = 'DESLIGADO',
  MATRICULADO = 'MATRICULADO',
  ALTA = 'ALTA'
}

export enum TipoEscola {
  PUBLICA = 'PUBLICA',
  PARTICULAR = 'PARTICULAR'
}

export enum GrauParentesco {
  PAI = 'PAI',
  MAE = 'MAE',
  AVO = 'AVO',
  TUTOR_LEGAL = 'TUTOR_LEGAL',
  OUTRO = 'OUTRO'
}

export interface Escola {
  idEscola?: number;
  nome: string;
  tipoEscola: TipoEscola | string;
  telefone: string;
}

export interface Responsavel {
  idResponsavel?: number;
  ocupacao: string;
  grauParentesco: GrauParentesco | string;
}

export interface Prontuario {
  idProntuario?: number;
  alergias: string;
  comorbidades: string;
  mobilidade: string;
}

export interface Paciente {
  idCadastro?: number;
  // Dados de Pessoa / Contato
  cpf: string;
  rg: string;
  nome: string;
  dataNascimento: string;
  sexo: string;
  celular: string;
  
  // Dados do Paciente
  statusPaciente: StatusPaciente | string;
  dataCadastro: string;
  convenio: boolean;

  // Relacionamentos
  escola?: Escola;
  responsavel?: Responsavel;
  prontuario?: Prontuario;
}