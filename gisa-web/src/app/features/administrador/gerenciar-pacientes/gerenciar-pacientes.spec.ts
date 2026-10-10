import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GerenciarPacientes } from './gerenciar-pacientes';

describe('GerenciarPacientes', () => {
  let component: GerenciarPacientes;
  let fixture: ComponentFixture<GerenciarPacientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarPacientes],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarPacientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
