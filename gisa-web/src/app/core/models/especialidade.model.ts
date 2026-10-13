// Especialidades (ver ESPECIALISTAS.md).

export interface Especialidade {
  idEspecialidade: number;
  nome: string;
  descricao: string | null;
}

// Corpo do POST /especialidades e item de `novasEspecialidades` no cadastro de especialista.
export interface NovaEspecialidade {
  nome: string;
  descricao?: string;
}
