import { ActivatedRoute } from '@angular/router';

// As telas de pacientes são compartilhadas entre perfis. Quem define o perfil é a ROTA:
//   /administrador/pacientes/...      -> acesso completo (padrão)
//   /assistente-social/pacientes/...  -> data: { somenteLeitura: true, rotaBasePacientes: '...' }
export interface ContextoPacientes {
  somenteLeitura: boolean;
  rotaBase: string;
}

export const ROTA_BASE_ADMIN = '/administrador/pacientes';

export function lerContextoPacientes(route: ActivatedRoute): ContextoPacientes {
  const dados = route.snapshot.data;
  return {
    somenteLeitura: dados['somenteLeitura'] === true,
    rotaBase: dados['rotaBasePacientes'] ?? ROTA_BASE_ADMIN,
  };
}
