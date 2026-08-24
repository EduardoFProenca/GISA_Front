import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { assistenteSocialGuard } from './assistente-social-guard';

describe('assistenteSocialGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => assistenteSocialGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
