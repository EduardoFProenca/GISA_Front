import { Cid, GrauParentesco, StatusPaciente } from './paciente.model';

export interface PacienteResumo {
  idCadastro: number;
  nome: string;
}

export interface ResponsavelResumo {
  nome: string;
  celular: string | null;
  grauParentesco: GrauParentesco;
}

// Item de GET /api/pacientes (idade vem calculada pelo back; CPF vem sem máscara).
export interface PacienteLista extends PacienteResumo {
  idade: number;
  cpf: string;
  responsaveis: ResponsavelResumo[];
  cids: Cid[];
  statusPaciente: StatusPaciente;
}
