import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { defer, from, map, switchMap, take } from 'rxjs';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const envInjector = inject(EnvironmentInjector);

  return defer(() => runInInjectionContext(envInjector, () => authState(auth))).pipe(
    take(1),
    switchMap((user) => {
      const email = user?.email?.trim().toLowerCase() ?? '';
      const isAllowed =
        Boolean(user) &&
        environment.adminEmails.some((allowed) => allowed.trim().toLowerCase() === email);

      if (isAllowed) {
        return from(Promise.resolve(true));
      }

      if (user) {
        return from(runInInjectionContext(envInjector, () => signOut(auth))).pipe(
          map(() => router.createUrlTree(['/login'])),
        );
      }

      return from(Promise.resolve(router.createUrlTree(['/login'])));
    }),
  );
};