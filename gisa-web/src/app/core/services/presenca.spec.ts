import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PresencaService } from './presenca';
import { StatusPresenca } from '../models/consulta-diaria.model';

// TODO(Etapa 3): reescrever junto com a integração da presença (rota /terapias/diarias não existe na API).
describe.skip('PresencaService', () => {
  let service: PresencaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PresencaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lista as consultas do dia enviando a data', () => {
    service.listarDoDia('2026-10-09').subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/terapias/diarias'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('data')).toBe('2026-10-09');
    req.flush([]);
  });

  it('registra a presença com PATCH', () => {
    service.registrar(1, 5, { presenca: StatusPresenca.PRESENTE }).subscribe();

    const req = http.expectOne((r) => r.url.endsWith('/terapias/1/pacientes/5/presenca'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ presenca: StatusPresenca.PRESENTE });
    req.flush({ idPaciente: 5, nome: 'Lucas', presenca: StatusPresenca.PRESENTE, justificativa: null });
  });
});