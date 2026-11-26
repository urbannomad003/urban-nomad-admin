import { Component } from '@angular/core';
import { UsersDashboard } from '../../components/users-module/users-dashboard/users-dashboard';
import { UsersListWidget } from '../../components/users-module/users-list-widget/users-list-widget';

@Component({
  selector: 'app-users',
  imports: [UsersDashboard, UsersListWidget],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {}