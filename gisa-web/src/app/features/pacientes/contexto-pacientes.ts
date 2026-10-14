import { ActivatedRoute } from '@angular/router';

// As telas de pacientes são compartilhadas entre painéis; a rota define a base
// (data.rotaBasePacientes). O que cada usuário pode fazer vem das permissões dele.
export interface ContextoPacientes {
  rotaBase: string;
}

export const ROTA_BASE_ADMIN = '/administrador/pacientes';

export function lerContextoPacientes(route: ActivatedRoute): ContextoPacientes {
  const dados = route.snapshot.data;
  return {
    rotaBase: dados['rotaBasePacientes'] ?? ROTA_BASE_ADMIN,
  };
}
