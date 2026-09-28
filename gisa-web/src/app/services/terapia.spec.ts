import { TestBed } from '@angular/core/testing';
import { Terapia } from './terapia';

describe('Terapia', () => {
  let service: Terapia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Terapia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
