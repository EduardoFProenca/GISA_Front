import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerenciarPaciente } from './gerenciar-paciente';

describe('GerenciarPaciente', () => {
  let component: GerenciarPaciente;
  let fixture: ComponentFixture<GerenciarPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarPaciente],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarPaciente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
