import { Component, EnvironmentInjector, inject, output, runInInjectionContext, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';
import {
  LucideAngularModule,
  Package,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-angular';

interface NavItem {
  label: string;
  route: string;
  icon: 'package' | 'users';
}

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './nav-bar.html',
})
export class NavBar {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly envInjector = inject(EnvironmentInjector);

  readonly loggedOut = output<void>();

  protected readonly isMobileMenuOpen = signal(false);
  protected readonly isLoggingOut = signal(false);

  protected readonly icons = {
    Package,
    Users,
    LogOut,
    Menu,
    X,
  };

  protected readonly navItems: NavItem[] = [
    {
      label: 'Products',
      route: '/products',
      icon: 'package',
    },
    {
      label: 'Users',
      route: '/users',
      icon: 'users',
    },
  ];

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected async logout(): Promise<void> {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);
    this.closeMobileMenu();

    try {
      await runInInjectionContext(this.envInjector, () => signOut(this.auth));
      this.loggedOut.emit();
      await this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('[NavBar] Logout failed:', error);
    } finally {
      this.isLoggingOut.set(false);
    }
  }
}