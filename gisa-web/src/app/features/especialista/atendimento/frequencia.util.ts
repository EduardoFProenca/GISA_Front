import { Presenca, Terapia, TerapiaDoEspecialista } from '../../../core/models/terapia.model';

// Regra institucional (CS06): o assistido precisa de pelo menos 75% de presença nas sessões do mês.
// ATENÇÃO: só PRESENTE conta como comparecimento; falta justificada entra como falta.
// Confirmar com a equipe da APAE se a falta justificada deve ser abonada.
export const LIMITE_FREQUENCIA = 75;

export interface SessaoMes {
  idTerapia: number;
  data: string;
  horaInicio: string;
  horaTermino: string;
  presenca: Presenca;
}

export interface Frequencia {
  rotulo: string;
  presencas: number;
  registradas: number; // sessões com presença já registrada (não PENDENTE)
  percentual: number | null; // null = nenhuma sessão registrada ainda
  abaixoDoLimite: boolean;
}

export interface FrequenciaMes {
  geral: Frequencia;
  porEspecialidade: Frequencia[];
  sessoes: SessaoMes[];
}

function frequencia(rotulo: string, presencas: Presenca[]): Frequencia {
  const registradas = presencas.filter((p) => p !== 'PENDENTE');
  const comparecimentos = registradas.filter((p) => p === 'PRESENTE').length;
  const percentual = registradas.length ? Math.round((comparecimentos / registradas.length) * 100) : null;
  return {
    rotulo,
    presencas: comparecimentos,
    registradas: registradas.length,
    percentual,
    abaixoDoLimite: percentual !== null && percentual < LIMITE_FREQUENCIA,
  };
}

// `terapias` = as do mês do paciente (GET /terapias?idPaciente=... ou, para o especialista,
// GET /terapias/minhas?idPaciente=...). Canceladas não contam.
// O agrupamento usa a primeira especialidade do primeiro especialista da terapia; /minhas não traz
// especialidades, então ali só existe a linha geral.
export function calcularFrequenciaMes(terapias: (Terapia | TerapiaDoEspecialista)[], idPaciente: number): FrequenciaMes {
  const validas = terapias.filter((t) => t.status !== 'CANCELADA');
  const linhas = validas.flatMap((t) => {
    const p = t.pacientes.find((x) => x.idCadastro === idPaciente);
    if (!p) return [];
    const rotulo = 'especialistas' in t ? (t.especialistas.flatMap((e) => e.especialidades)[0] ?? 'Sem especialidade') : null;
    return [{ t, presenca: p.presenca, rotulo }];
  });

  const grupos = new Map<string, Presenca[]>();
  for (const l of linhas) {
    if (l.rotulo !== null) grupos.set(l.rotulo, [...(grupos.get(l.rotulo) ?? []), l.presenca]);
  }

  return {
    geral: frequencia('Todas as terapias', linhas.map((l) => l.presenca)),
    porEspecialidade: [...grupos.entries()]
      .map(([rotulo, presencas]) => frequencia(rotulo, presencas))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo)),
    sessoes: linhas
      .map((l) => ({
        idTerapia: l.t.idTerapia,
        data: l.t.data,
        horaInicio: l.t.horaInicio.slice(0, 5),
        horaTermino: l.t.horaTermino.slice(0, 5),
        presenca: l.presenca,
      }))
      .sort((a, b) => `${a.data}${a.horaInicio}`.localeCompare(`${b.data}${b.horaInicio}`)),
  };
}
