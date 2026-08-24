import { TestBed } from '@angular/core/testing';
import { Recusa } from './recusa';

describe('Recusa', () => {
  let service: Recusa;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recusa);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
