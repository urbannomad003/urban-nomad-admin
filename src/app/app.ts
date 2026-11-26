import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NavBar } from './components/common-module/nav-bar/nav-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);

  protected readonly showShell = signal(!this.isAuthRoute(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showShell.set(!this.isAuthRoute(event.urlAfterRedirects));
      });
  }

  private isAuthRoute(url: string): boolean {
    const cleanUrl = url.split('?')[0].split('#')[0];
    return cleanUrl === '/login' || cleanUrl === '/reset-password';
  }
}