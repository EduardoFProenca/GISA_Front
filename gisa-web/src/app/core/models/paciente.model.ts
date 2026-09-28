export type StatusPaciente = 'MATRICULADO' | 'DESLIGADO' | 'ALTA';

export type TipoEscola = 'PUBLICA' | 'PRIVADA';

export type GrauParentesco = 
  | 'PAI' 
  | 'MAE' 
  | 'AVO' 
  | 'TIO' 
  | 'IRMAO' 
  | 'TUTOR_LEGAL' 
  | 'OUTRO';

// Interface do CID (Relação Many-to-Many com Paciente)
export interface Cid {
  idCid?: number;
  codigoCID: string;
  descricao: string;
}

// Interface da Escola (Relação 1-to-Many / 1-to-1)
export interface Escola {
  idEscola?: number;
  nome: string;
  tipoEscola?: TipoEscola;
  telefone?: string;
}

// Interface do Prontuário (Composição de 1-to-1)
export interface Prontuario {
  idProntuario?: number;
  alergias?: string;
  comorbidade?: string;
  mobilidade?: string;
}

// Interface do Responsável
export interface Responsavel {
  idResponsavel?: number;
  nome: string;
  cpf: string;
  telefone: string;
  ocupacao?: string; // Atributo presente no diagrama
}

// Classe/Tabela de Associação do Vínculo entre Paciente e Responsável
export interface VinculoResponsavel {
  idVinculo?: number;
  responsavel: Responsavel;
  grauParentesco: GrauParentesco; // Grau de parentesco fica na relação
}

// Interface Principal do Paciente
export interface Paciente {
  idPaciente?: number;
  nome: string;
  cpf: string;
  dataNascimento?: string;
  statusPaciente: StatusPaciente;
  convenio: boolean;
  dataCadastro?: string;
  
  // Relacionamentos do Diagrama
  vinculosResponsavel?: VinculoResponsavel[]; // Suporta múltiplos responsáveis
  escola?: Escola;
  prontuario?: Prontuario;
  cids?: Cid[];                               // Suporta múltiplos CIDs (* para 0..*)
}