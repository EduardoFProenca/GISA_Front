import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinhaPacientePresenca } from './linha-paciente-presenca';
import { PacienteTerapia } from '../../../../../core/models/terapia.model';

const paciente: PacienteTerapia = {
  idCadastro: 5,
  nome: 'Lucas Santos',
  presenca: 'PENDENTE',
  justificativa: null,
  presencasPermitidas: ['PRESENTE', 'FALTA_INJUSTIFICADA', 'FALTA_JUSTIFICADA', 'PENDENTE'],
};

describe('LinhaPacientePresenca', () => {
  let component: LinhaPacientePresenca;
  let fixture: ComponentFixture<LinhaPacientePresenca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LinhaPacientePresenca] }).compileComponents();
    fixture = TestBed.createComponent(LinhaPacientePresenca);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('paciente', paciente);
    await fixture.whenStable();
  });

  it('mostra "Pendente" quando ainda não há presença', () => {
    expect(component.rotulo()).toBe('Pendente');
  });

  it('não emite falta justificada sem motivo', () => {
    let emitido: string | undefined;
    component.marcarFaltaJustificada.subscribe((v) => (emitido = v));

    component.abrir();
    component.texto.set('   ');
    component.confirmar();

    expect(emitido).toBe(undefined);
    expect(component.editando()).toBe(true);
  });

  it('emite o motivo sem espaços nas pontas', () => {
    let emitido: string | undefined;
    component.marcarFaltaJustificada.subscribe((v) => (emitido = v));

    component.abrir();
    component.texto.set('  atestado médico ');
    component.confirmar();

    expect(emitido).toBe('atestado médico');
  });

  it('fecha o formulário quando o paciente é atualizado', async () => {
    component.abrir();
    expect(component.editando()).toBe(true);

    fixture.componentRef.setInput('paciente', { ...paciente, presenca: 'FALTA_JUSTIFICADA', justificativa: 'atestado' });
    await fixture.whenStable();

    expect(component.editando()).toBe(false);
  });
});