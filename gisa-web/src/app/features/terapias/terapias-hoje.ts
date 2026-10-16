import { Observable, map } from 'rxjs';
import { Terapia } from '../../core/models/terapia.model';
import { TerapiaService } from '../../core/services/terapia';
import { Atividade } from '../../shared/components/atividades-recentes/atividades-recentes';
import { hojeIso } from '../../shared/utils/data.util';
import { ROTULO_STATUS_TERAPIA } from '../../shared/utils/rotulos.util';
import { horarioTerapia } from './registrar-presenca/presenca.util';

// Terapias de hoje como itens do bloco "Terapias de hoje" do Início.
export function terapiasDeHoje(
  service: TerapiaService,
  abrir: (t: Terapia) => void,
  limite = 6
): Observable<{ total: number; atividades: Atividade[] }> {
  return service.listar({ data: hojeIso(), size: limite, sort: 'dataHoraInicio,asc' }).pipe(
    map((p) => ({
      total: p.totalElements,
      atividades: p.content.map((t) => ({
        descricao: `${horarioTerapia(t)} · ${t.titulo}`,
        tempoAtras: `${ROTULO_STATUS_TERAPIA[t.status]} · ${t.especialistas.map((e) => e.nome).join(', ')}`,
        acoes: [{ label: 'Ver', acao: () => abrir(t) }],
      })),
    }))
  );
}
