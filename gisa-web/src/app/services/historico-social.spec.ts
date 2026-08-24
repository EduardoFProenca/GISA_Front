import { TestBed } from '@angular/core/testing';
import { HistoricoSocial } from './historico-social';

describe('HistoricoSocial', () => {
  let service: HistoricoSocial;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoricoSocial);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
