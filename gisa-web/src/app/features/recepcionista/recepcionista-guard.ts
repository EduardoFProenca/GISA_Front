import { CanActivateFn } from '@angular/router';

export const recepcionistaGuard: CanActivateFn = (route, state) => {
  return true;
};
