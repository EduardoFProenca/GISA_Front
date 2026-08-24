import { CanActivateFn } from '@angular/router';

export const medicoGuard: CanActivateFn = (route, state) => {
  return true;
};
