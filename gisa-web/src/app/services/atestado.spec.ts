import { TestBed } from '@angular/core/testing';
import { Atestado } from './atestado';

describe('Atestado', () => {
  let service: Atestado;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Atestado);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
