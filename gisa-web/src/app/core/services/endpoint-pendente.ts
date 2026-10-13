import { HttpErrorResponse } from '@angular/common/http';
import { mensagemDeErro } from '../http/erro-api';

// Alguns endpoints das telas do especialista (remarcação, evolução) ainda não existem na API-GISA.
// Quando a rota não existe o Spring responde 404/405/501: mostramos um aviso claro em vez de erro genérico.
export const MSG_RECURSO_PENDENTE =
  'Este recurso ainda não está disponível no servidor (rota não encontrada). Avise a equipe do back-end.';

export function mensagemDeErroRecurso(err: unknown, padrao: string): string {
  if (err instanceof HttpErrorResponse && [404, 405, 501].includes(err.status)) return MSG_RECURSO_PENDENTE;
  return mensagemDeErro(err, padrao);
}
