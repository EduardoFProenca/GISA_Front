import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AgendaEspecialista } from './agenda-especialista';

describe('AgendaEspecialista', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaEspecialista],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(AgendaEspecialista).componentInstance).toBeTruthy();
  });
});
