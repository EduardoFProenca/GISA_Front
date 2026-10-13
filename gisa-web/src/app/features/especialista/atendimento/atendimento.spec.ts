import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AtendimentoEspecialista } from './atendimento';

describe('AtendimentoEspecialista', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [AtendimentoEspecialista],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(AtendimentoEspecialista).componentInstance).toBeTruthy();
  });
});
