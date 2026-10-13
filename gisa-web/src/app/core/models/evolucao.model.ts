// ATENÇÃO: o backend (API-GISA) ainda NÃO tem endpoint de evolução clínica. Formato proposto pelo front
// (ver EvolucaoService).

// Corpo do POST /pacientes/{id}/evolucoes (modelo PTS - Projeto Terapêutico Singular).
export interface EvolucaoPayload {
  idTerapia: number | null; // sessão de origem, quando o atendimento veio da agenda
  evolucaoPts: string;
  metas: string;
  condutas: string;
  orientacoesCuidadores: string;
}
