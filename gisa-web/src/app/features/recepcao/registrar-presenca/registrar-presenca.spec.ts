import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RegistrarPresenca } from './registrar-presenca';
import { ConsultaDiaria, StatusPresenca } from '../../../core/models/consulta-diaria.model';
import { Modalidade, StatusTerapia } from '../../../core/models/consulta.model';

const consulta: ConsultaDiaria = {
  idTerapia: 1,
  dataHoraInicio: '2026-10-09T09:00:00',
  dataHoraFim: '2026-10-09T09:50:00',
  modalidade: Modalidade.INDIVIDUAL,
  status: StatusTerapia.AGENDADA,
  especialistas: [{ idEspecialista: 10, nome: 'Dra. Ana Souza' }],
  pacientes: [{ idPaciente: 5, nome: 'Lucas Santos', presenca: null, justificativa: null }],
};

// TODO(Etapa 3): reescrever junto com a integração da presença (rota /terapias/diarias não existe na API).
describe.skip('RegistrarPresenca', () => {
  let component: RegistrarPresenca;
  let fixture: ComponentFixture<RegistrarPresenca>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarPresenca],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarPresenca);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  function responderLista(lista: ConsultaDiaria[]) {
    http.expectOne((r) => r.url.endsWith('/terapias/diarias')).flush(lista);
  }

  it('should create', () => {
    responderLista([]);
    expect(component).toBeTruthy();
  });

  it('carrega as consultas do dia e calcula o resumo', () => {
    responderLista([consulta]);

    expect(component.carregando()).toBe(false);
    expect(component.resumo().consultas).toBe(1);
    expect(component.resumo().pendentes).toBe(1);
  });

  it('registra presença e atualiza o resumo', () => {
    responderLista([consulta]);

    component.registrar(consulta, { idPaciente: 5, presenca: StatusPresenca.PRESENTE, justificativa: null });

    const req = http.expectOne((r) => r.url.endsWith('/terapias/1/pacientes/5/presenca'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ presenca: StatusPresenca.PRESENTE, justificativa: null });
    req.flush({ idPaciente: 5, nome: 'Lucas Santos', presenca: StatusPresenca.PRESENTE, justificativa: null });

    expect(component.resumo().presentes).toBe(1);
    expect(component.resumo().pendentes).toBe(0);
    expect(component.salvando()).toBe(null);
  });

  it('mostra erro quando registrar falha e mantém o paciente pendente', () => {
    responderLista([consulta]);

    component.registrar(consulta, { idPaciente: 5, presenca: StatusPresenca.FALTA_INJUSTIFICADA, justificativa: null });
    http
      .expectOne((r) => r.url.endsWith('/terapias/1/pacientes/5/presenca'))
      .flush({ message: 'Consulta cancelada' }, { status: 409, statusText: 'Conflict' });

    expect(component.erro()).toBe('Consulta cancelada');
    expect(component.resumo().pendentes).toBe(1);
  });

  it('mostra erro quando a listagem falha', () => {
    http
      .expectOne((r) => r.url.endsWith('/terapias/diarias'))
      .flush({ message: 'Falha' }, { status: 500, statusText: 'Server Error' });

    expect(component.erro()).toBe('Falha');
    expect(component.carregando()).toBe(false);
  });
});