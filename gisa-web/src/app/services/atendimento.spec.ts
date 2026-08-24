import { TestBed } from '@angular/core/testing';
import { Atendimento } from './atendimento';

describe('Atendimento', () => {
  let service: Atendimento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Atendimento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
