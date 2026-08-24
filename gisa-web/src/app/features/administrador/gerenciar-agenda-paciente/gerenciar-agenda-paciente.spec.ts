import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerenciarAgendaPaciente } from './gerenciar-agenda-paciente';

describe('GerenciarAgendaPaciente', () => {
  let component: GerenciarAgendaPaciente;
  let fixture: ComponentFixture<GerenciarAgendaPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarAgendaPaciente],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarAgendaPaciente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
