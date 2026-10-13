import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CriarConsulta } from './criar-consulta';
import { Modalidade } from '../../../core/models/consulta.model';

describe('CriarConsulta', () => {
  let component: CriarConsulta;
  let fixture: ComponentFixture<CriarConsulta>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarConsulta],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarConsulta);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  function preencherBasico(modalidade: Modalidade) {
    component.idPaciente.set(1);
    component.idEspecialista.set(10);
    component.modalidade.set(modalidade);
    component.data.set('2026-10-10');
    component.horaInicio.set('09:00');
    component.horaTermino.set('10:00');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('só é coletiva quando a modalidade é COLETIVA', () => {
    expect(component.ehColetiva()).toBe(false);
    component.modalidade.set(Modalidade.INDIVIDUAL);
    expect(component.ehColetiva()).toBe(false);
    component.modalidade.set(Modalidade.COLETIVA);
    expect(component.ehColetiva()).toBe(true);
  });

  it('adiciona e remove pessoas extras', () => {
    component.adicionarPessoa('paciente');
    component.adicionarPessoa('especialista');
    expect(component.pacientesExtras().length).toBe(1);
    expect(component.especialistasExtras().length).toBe(1);

    component.removerPessoa('paciente', component.pacientesExtras()[0].uid);
    expect(component.pacientesExtras().length).toBe(0);
    expect(component.especialistasExtras().length).toBe(1);
  });

  it('tira das opções quem já foi escolhido em outro campo do mesmo tipo', () => {
    component.opcoesPacientes.set([
      { id: 1, label: 'Ana' },
      { id: 2, label: 'Bia' },
      { id: 3, label: 'Caio' },
    ]);
    component.modalidade.set(Modalidade.COLETIVA);
    component.idPaciente.set(1);
    component.adicionarPessoa('paciente');
    const uid = component.pacientesExtras()[0].uid;
    component.aoMudarExtra('paciente', uid, 2);

    expect(component.opcoesDisponiveis('paciente', 'principal').map((o) => o.id)).toEqual([1, 3]);
    expect(component.opcoesDisponiveis('paciente', uid).map((o) => o.id)).toEqual([2, 3]);
  });

  it('mantém a mesma referência de opções enquanto nada mudou', () => {
    component.opcoesPacientes.set([
      { id: 1, label: 'Ana' },
      { id: 2, label: 'Bia' },
    ]);
    component.idPaciente.set(1);

    const primeira = component.opcoesDisponiveis('paciente', 'principal');
    const segunda = component.opcoesDisponiveis('paciente', 'principal');
    expect(primeira === segunda).toBe(true);
  });

  it('não aceita campo extra vazio em consulta coletiva', () => {
    preencherBasico(Modalidade.COLETIVA);
    component.adicionarPessoa('paciente');
    const uid = component.pacientesExtras()[0].uid;

    component.salvarConsulta();

    expect(component.erros()[`paciente-${uid}`]).toBe('Selecione a pessoa ou remova este campo.');
    expect(component.salvando()).toBe(false);
  });

  it('envia as pessoas adicionais na consulta coletiva', () => {
    preencherBasico(Modalidade.COLETIVA);
    component.adicionarPessoa('paciente');
    component.adicionarPessoa('especialista');
    component.aoMudarExtra('paciente', component.pacientesExtras()[0].uid, 2);
    component.aoMudarExtra('especialista', component.especialistasExtras()[0].uid, 11);

    component.salvarConsulta();

    const req = http.expectOne((r) => r.method === 'POST' && r.url.endsWith('/terapias'));
    expect(req.request.body).toEqual({
      idPaciente: 1,
      idEspecialista: 10,
      modalidade: Modalidade.COLETIVA,
      dataHoraInicio: '2026-10-10T09:00:00',
      dataHoraFim: '2026-10-10T10:00:00',
      idsPacientesAdicionais: [2],
      idsEspecialistasAdicionais: [11],
    });
  });

  it('ignora extras guardados quando a modalidade é individual', () => {
    component.modalidade.set(Modalidade.COLETIVA);
    component.adicionarPessoa('paciente');
    component.aoMudarExtra('paciente', component.pacientesExtras()[0].uid, 2);
    preencherBasico(Modalidade.INDIVIDUAL);

    component.salvarConsulta();

    const req = http.expectOne((r) => r.method === 'POST' && r.url.endsWith('/terapias'));
    expect('idsPacientesAdicionais' in req.request.body).toBe(false);
    expect('idsEspecialistasAdicionais' in req.request.body).toBe(false);
  });
});