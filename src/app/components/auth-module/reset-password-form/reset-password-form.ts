import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule, Mail, Send } from 'lucide-angular';
import { ResetPasswordService } from '../../../services/auth-module/reset-password.service';

@Component({
  selector: 'app-reset-password-form',
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './reset-password-form.html',
})
export class ResetPasswordForm {
  private readonly resetPasswordService = inject(ResetPasswordService);

  protected readonly icons = { ArrowLeft, Mail, Send };

  protected email = '';

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.email.trim()) {
      this.errorMessage.set('Please enter your account email address.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      await this.resetPasswordService.sendResetEmail(this.email);
      this.successMessage.set(
        `Password reset link sent to ${this.email.trim()}. Check your inbox and spam folder.`,
      );
      this.email = '';
    } catch (error) {
      this.errorMessage.set(this.resetPasswordService.mapErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}