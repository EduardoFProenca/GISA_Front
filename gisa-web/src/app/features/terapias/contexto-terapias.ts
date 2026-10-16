import { ActivatedRoute } from '@angular/router';

// As telas de terapia servem à listagem geral (/terapias) e às terapias do especialista
// (/minhas-terapias): a rota define a base e o título.
export interface ContextoTerapias {
  rotaBase: string;
  titulo: string;
}

export function lerContextoTerapias(route: ActivatedRoute): ContextoTerapias {
  const dados = route.snapshot.data;
  return {
    rotaBase: dados['rotaBaseTerapias'] ?? '/terapias',
    titulo: dados['tituloTerapias'] ?? 'Gestão de Terapias',
  };
}
