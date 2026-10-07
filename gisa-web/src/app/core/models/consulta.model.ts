// Segue a classe "Terapia" do diagrama ClasseAPAE (a "Consulta" da tela).

export enum Modalidade {
  INDIVIDUAL = 'INDIVIDUAL',
  COLETIVA = 'COLETIVA'
}

export enum StatusTerapia {
  AGENDADA = 'AGENDADA',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO'
}

// Atributos da classe Terapia (LocalDateTime trafega como 'yyyy-MM-ddTHH:mm:ss')
export interface Terapia {
  idTerapia?: number;
  dataHoraInicio: string;
  dataHoraFim: string;
  modalidade: Modalidade;
  status: StatusTerapia;
}

// Terapia se associa a um Especialista e a um Paciente
export interface NovaTerapia {
  idPaciente: number;
  idEspecialista: number;
  // TODO(Kauã): só vêm preenchidos quando modalidade = COLETIVA. São as pessoas
  // além do paciente/especialista principais acima (ex: List<Long> no DTO do Spring).
  idsPacientesAdicionais?: number[];
  idsEspecialistasAdicionais?: number[];
  dataHoraInicio: string;
  dataHoraFim: string;
  modalidade: Modalidade;
}