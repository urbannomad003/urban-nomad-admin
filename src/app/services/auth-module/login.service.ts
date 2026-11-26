import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import {
  Auth,
  User,
  authState,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { Observable, defer } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly auth = inject(Auth);
  private readonly envInjector = inject(EnvironmentInjector);

  readonly currentUser$: Observable<User | null> = defer(() =>
    runInInjectionContext(this.envInjector, () => authState(this.auth)),
  );

  isAllowedAdminEmail(email: string | null | undefined): boolean {
    if (!email) {
      return false;
    }
    const normalized = email.trim().toLowerCase();
    return environment.adminEmails.some((allowed) => allowed.trim().toLowerCase() === normalized);
  }

  async login(email: string, password: string): Promise<UserCredential> {
    const cleanEmail = email.trim();
    const credential = await runInInjectionContext(this.envInjector, () =>
      signInWithEmailAndPassword(this.auth, cleanEmail, password),
    );

    if (!this.isAllowedAdminEmail(credential.user.email)) {
      await runInInjectionContext(this.envInjector, () => signOut(this.auth));
      throw { code: 'auth/unauthorized-admin' };
    }

    return credential;
  }

  async signOutCurrentUser(): Promise<void> {
    await runInInjectionContext(this.envInjector, () => signOut(this.auth));
  }

  mapErrorMessage(error: unknown): string {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';

    switch (code) {
      case 'auth/unauthorized-admin':
        return 'This account is not authorized to access the Urban Nomad Admin Panel.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact a system administrator.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error while signing in. Check your connection and try again.';
      default:
        return 'Unable to sign in right now. Please try again.';
    }
  }
}