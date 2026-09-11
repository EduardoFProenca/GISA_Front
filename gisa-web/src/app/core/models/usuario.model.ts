export interface Usuario {
     id: string;
  nome: string;
  nomePreferido: string;
  cargo: 'Recepcionista' | 'Médico' | 'Assistente Social' | 'Administrador';
  corPerfil: string;
  fotoUrl?: string;
}
