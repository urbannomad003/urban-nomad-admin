import { Component } from '@angular/core';
import { ResetPasswordForm } from '../../../components/auth-module/reset-password-form/reset-password-form';

@Component({
  selector: 'app-reset-password',
  imports: [ResetPasswordForm],
  templateUrl: './reset-password.html',
})
export class ResetPassword {}