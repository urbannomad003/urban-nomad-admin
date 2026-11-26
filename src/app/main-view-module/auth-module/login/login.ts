import { Component } from '@angular/core';
import { LoginForm } from '../../../components/auth-module/login-form/login-form';

@Component({
  selector: 'app-login',
  imports: [LoginForm],
  templateUrl: './login.html',
})
export class Login {}