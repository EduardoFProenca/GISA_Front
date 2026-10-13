import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConsultaDiaria,
  PacienteConsulta,
  RegistrarPresencaRequest,
  StatusPresenca,
} from '../models/consulta-diaria.model';
import { Modalidade, StatusTerapia } from '../models/consulta.model';

// TEMPORÁRIO: true = não chama a API, usa dados em memória (somem ao recarregar a página).
// Mude para false quando o Kauã publicar os endpoints de presença.
const USAR_MOCK = true;
const ATRASO_MOCK_MS = 300;

@Injectable({ providedIn: 'root' })
export class PresencaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/terapias`;

  // Mock: consultas por data (yyyy-MM-dd), criadas na primeira vez que a data é pedida.
  private mockPorData = new Map<string, ConsultaDiaria[]>();

  // ATENÇÃO: endpoints assumidos (TODO(Kauã)):
  // GET   /terapias/diarias?data=yyyy-MM-dd
  // PATCH /terapias/{idTerapia}/pacientes/{idPaciente}/presenca

  // data no formato yyyy-MM-dd
  listarDoDia(data: string): Observable<ConsultaDiaria[]> {
    if (USAR_MOCK) {
      return of(this.mockDoDia(data)).pipe(delay(ATRASO_MOCK_MS));
    }

    const params = new HttpParams().set('data', data);
    return this.http.get<ConsultaDiaria[]>(`${this.base}/diarias`, { params });
  }

  registrar(
    idTerapia: number,
    idPaciente: number,
    dados: RegistrarPresencaRequest
  ): Observable<PacienteConsulta> {
    if (USAR_MOCK) {
      return this.registrarMock(idTerapia, idPaciente, dados);
    }

    return this.http.patch<PacienteConsulta>(
      `${this.base}/${idTerapia}/pacientes/${idPaciente}/presenca`,
      dados
    );
  }

  // ---------- MOCK ----------

  private mockDoDia(data: string): ConsultaDiaria[] {
    let lista = this.mockPorData.get(data);
    if (!lista) {
      lista = this.criarMock(data);
      this.mockPorData.set(data, lista);
    }
    // cópia: a tela substitui a lista, não deve mutar o que está guardado
    return lista.map((c) => ({ ...c, pacientes: c.pacientes.map((p) => ({ ...p })) }));
  }

  private registrarMock(
    idTerapia: number,
    idPaciente: number,
    dados: RegistrarPresencaRequest
  ): Observable<PacienteConsulta> {
    for (const lista of this.mockPorData.values()) {
      const consulta = lista.find((c) => c.idTerapia === idTerapia);
      const paciente = consulta?.pacientes.find((p) => p.idPaciente === idPaciente);
      if (paciente) {
        paciente.presenca = dados.presenca;
        paciente.justificativa =
          dados.presenca === StatusPresenca.FALTA_JUSTIFICADA ? dados.justificativa ?? null : null;
        return of({ ...paciente }).pipe(delay(ATRASO_MOCK_MS));
      }
    }
    return throwError(() => ({ error: { message: 'Consulta ou paciente não encontrado (mock).' } }));
  }

  private criarMock(data: string): ConsultaDiaria[] {
    const base = Number(data.replace(/-/g, '')) * 10;

    return [
      {
        idTerapia: base + 1,
        dataHoraInicio: `${data}T08:00:00`,
        dataHoraFim: `${data}T08:50:00`,
        modalidade: Modalidade.INDIVIDUAL,
        status: StatusTerapia.AGENDADA,
        especialistas: [{ idEspecialista: 1, nome: 'Dra. Ana Souza (Psicologia)' }],
        pacientes: [
          { idPaciente: 101, nome: 'Maria Costa', presenca: null, justificativa: null },
        ],
      },
      {
        idTerapia: base + 2,
        dataHoraInicio: `${data}T09:00:00`,
        dataHoraFim: `${data}T10:00:00`,
        modalidade: Modalidade.COLETIVA,
        status: StatusTerapia.AGENDADA,
        especialistas: [
          { idEspecialista: 2, nome: 'Dr. Carlos Lima (Fonoaudiologia)' },
          { idEspecialista: 3, nome: 'Dra. Paula Rocha (Terapia Ocupacional)' },
        ],
        pacientes: [
          { idPaciente: 102, nome: 'Pedro Alves', presenca: StatusPresenca.PRESENTE, justificativa: null },
          { idPaciente: 103, nome: 'João Pereira', presenca: null, justificativa: null },
          { idPaciente: 104, nome: 'Lucas Martins', presenca: null, justificativa: null },
        ],
      },
      {
        idTerapia: base + 3,
        dataHoraInicio: `${data}T14:00:00`,
        dataHoraFim: `${data}T14:50:00`,
        modalidade: Modalidade.INDIVIDUAL,
        status: StatusTerapia.AGENDADA,
        especialistas: [{ idEspecialista: 4, nome: 'Dra. Fernanda Dias (Fisioterapia)' }],
        pacientes: [
          {
            idPaciente: 105,
            nome: 'Ana Beatriz Santos',
            presenca: StatusPresenca.FALTA_JUSTIFICADA,
            justificativa: 'Atestado médico apresentado pela mãe',
          },
        ],
      },
    ];
  }
}