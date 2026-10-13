import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EditarProfissional } from './editar-profissional';

describe('EditarProfissional', () => {
  let component: EditarProfissional;
  let fixture: ComponentFixture<EditarProfissional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarProfissional],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarProfissional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra erro quando o id da rota é inválido', () => {
    expect(component.carregado()).toBe(false);
    expect(component.erro()).toBe('Profissional inválido.');
  });
});