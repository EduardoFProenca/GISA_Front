import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastrarPaciente } from './cadastrar-paciente';

describe('CadastrarPaciente', () => {
  let component: CadastrarPaciente;
  let fixture: ComponentFixture<CadastrarPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarPaciente],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastrarPaciente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
