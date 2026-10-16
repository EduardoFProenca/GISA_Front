import { ActivatedRoute } from '@angular/router';

// As telas de pacientes leem a base das rotas de data.rotaBasePacientes (hoje sempre /pacientes).
// O que cada usuário pode fazer vem das permissões dele.
export interface ContextoPacientes {
  rotaBase: string;
}

export const ROTA_BASE_PACIENTES = '/pacientes';

export function lerContextoPacientes(route: ActivatedRoute): ContextoPacientes {
  const dados = route.snapshot.data;
  return {
    rotaBase: dados['rotaBasePacientes'] ?? ROTA_BASE_PACIENTES,
  };
}
