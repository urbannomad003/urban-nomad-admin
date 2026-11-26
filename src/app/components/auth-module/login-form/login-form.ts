import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Eye, EyeOff, Lock, LogIn, LucideAngularModule, Mail } from 'lucide-angular';
import { LoginService } from '../../../services/auth-module/login.service';

@Component({
  selector: 'app-login-form',
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login-form.html',
})
export class LoginForm {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  readonly loggedIn = output<void>();

  protected readonly icons = { Eye, EyeOff, Lock, LogIn, Mail };

  protected email = '';
  protected password = '';
  protected showPassword = false;

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    if (!this.email.trim()) {
      this.errorMessage.set('Email address is required.');
      return;
    }

    if (!this.password) {
      this.errorMessage.set('Password is required.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      await this.loginService.login(this.email, this.password);
      this.loggedIn.emit();
      await this.router.navigateByUrl('/products');
    } catch (error) {
      this.errorMessage.set(this.loginService.mapErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}