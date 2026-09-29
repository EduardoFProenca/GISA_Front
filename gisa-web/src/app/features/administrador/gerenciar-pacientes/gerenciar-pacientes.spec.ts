import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerenciarPacientes } from './gerenciar-pacientes';

describe('GerenciarPacientes', () => {
  let component: GerenciarPacientes;
  let fixture: ComponentFixture<GerenciarPacientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarPacientes],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarPacientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
