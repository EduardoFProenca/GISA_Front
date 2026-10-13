import { ActivatedRoute } from '@angular/router';

// As telas de terapia são compartilhadas entre painéis; a rota define a base e o título.
export interface ContextoTerapias {
  rotaBase: string;
  titulo: string;
}

export function lerContextoTerapias(route: ActivatedRoute): ContextoTerapias {
  const dados = route.snapshot.data;
  return {
    rotaBase: dados['rotaBaseTerapias'] ?? '/administrador/terapias',
    titulo: dados['tituloTerapias'] ?? 'Gestão de Terapias',
  };
}
