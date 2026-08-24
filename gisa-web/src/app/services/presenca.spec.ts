import { TestBed } from '@angular/core/testing';
import { Presenca } from './presenca';

describe('Presenca', () => {
  let service: Presenca;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Presenca);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
