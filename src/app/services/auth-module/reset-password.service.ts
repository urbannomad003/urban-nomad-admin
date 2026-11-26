import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
  private readonly auth = inject(Auth);
  private readonly envInjector = inject(EnvironmentInjector);

  async sendResetEmail(email: string): Promise<void> {
    const cleanEmail = email.trim();
    await runInInjectionContext(this.envInjector, () =>
      sendPasswordResetEmail(this.auth, cleanEmail),
    );
  }

  mapErrorMessage(error: unknown): string {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';

    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with that email address.';
      case 'auth/too-many-requests':
        return 'Too many reset requests. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error while sending reset email. Check your connection and try again.';
      default:
        return 'Unable to send password reset email right now. Please try again.';
    }
  }
}