import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardEspecialista } from './dashboard';

describe('DashboardEspecialista', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEspecialista],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(DashboardEspecialista).componentInstance).toBeTruthy();
  });
});
