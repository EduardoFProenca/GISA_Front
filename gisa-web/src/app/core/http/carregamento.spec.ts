import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { CarregamentoService, SEM_CARREGAMENTO, carregamentoInterceptor, comCarregamento } from './carregamento';

describe('carregamentoInterceptor', () => {
  let http: HttpClient;
  let controle: HttpTestingController;
  let carregamento: CarregamentoService;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([carregamentoInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    controle = TestBed.inject(HttpTestingController);
    carregamento = TestBed.inject(CarregamentoService);
  });

  it('fica ativo enquanto uma ação que grava está pendente', () => {
    http.post(`${api}/cargos`, {}).subscribe();
    expect(carregamento.ativo()).toBe(true);
    controle.expectOne(`${api}/cargos`).flush({});
    expect(carregamento.ativo()).toBe(false);
  });

  it('desativa também quando a ação falha', () => {
    http.delete(`${api}/cargos/1`).subscribe({ error: () => {} });
    controle.expectOne(`${api}/cargos/1`).flush({}, { status: 400, statusText: 'Bad Request' });
    expect(carregamento.ativo()).toBe(false);
  });

  it('ignora consultas, o login, APIs externas e requisições marcadas', () => {
    http.get(`${api}/cargos`).subscribe();
    http.post(`${api}/auth/login`, {}).subscribe();
    http.post('https://viacep.com.br/ws/18010000/json/', {}).subscribe();
    http.post(`${api}/terapias/verificar-conflitos`, {}, { context: new HttpContext().set(SEM_CARREGAMENTO, true) }).subscribe();
    expect(carregamento.ativo()).toBe(false);
  });

  it('mostra "Carregando..." nas leituras que pedem o overlay', () => {
    http.get(`${api}/pacientes/1`, { context: comCarregamento() }).subscribe();
    expect(carregamento.ativo()).toBe(true);
    expect(carregamento.mensagem()).toBe('Carregando...');
    controle.expectOne(`${api}/pacientes/1`).flush({});
    expect(carregamento.ativo()).toBe(false);
  });
});
