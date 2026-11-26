import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  LucideAngularModule,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-angular';
import { UsersListService } from '../../../services/users-module/users-list/users-list.service';
import { AppUser } from '../../../models/users';

@Component({
  selector: 'app-users-dashboard',
  imports: [LucideAngularModule],
  templateUrl: './users-dashboard.html',
})
export class UsersDashboard implements OnInit, OnDestroy {
  private readonly usersListService = inject(UsersListService);
  private readonly carouselTrack = viewChild<ElementRef<HTMLDivElement>>('carouselTrack');
  private subscription?: Subscription;

  protected readonly icons = {
    Award,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    UserPlus,
    Users,
  };

  protected readonly cardIndices = [0, 1, 2, 3];
  protected readonly activeSlide = signal(0);

  protected readonly users = signal<AppUser[]>([]);
  protected readonly isLoading = signal(true);

  protected readonly totalUsers = computed(() => this.users().length);

  protected readonly newUsersLast3Months = computed(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    const cutoffMs = cutoff.getTime();

    return this.users().filter((user) => {
      const createdMs = this.parseDateMs(user.createdAt);
      return createdMs !== null && createdMs >= cutoffMs;
    }).length;
  });

  protected readonly loyaltyMembersCount = computed(
    () => this.users().filter((u) => Boolean(u.isLoyaltyMember)).length,
  );

  protected readonly verifiedEmailsCount = computed(
    () => this.users().filter((u) => Boolean(u.emailVerified)).length,
  );

  ngOnInit(): void {
    this.subscription = this.usersListService.getUsersLive().subscribe({
      next: (list) => {
        this.users.set(list);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[UsersDashboard] Stream error:', err);
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected onCarouselScroll(): void {
    const el = this.carouselTrack()?.nativeElement;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    const clamped = Math.min(Math.max(0, index), this.cardIndices.length - 1);
    this.activeSlide.set(clamped);
  }

  protected scrollToSlide(index: number): void {
    const clamped = Math.min(Math.max(0, index), this.cardIndices.length - 1);
    this.activeSlide.set(clamped);

    const el = this.carouselTrack()?.nativeElement;
    if (!el) return;
    el.scrollTo({
      left: clamped * el.clientWidth,
      behavior: 'smooth',
    });
  }

  protected prevSlide(): void {
    this.scrollToSlide(this.activeSlide() - 1);
  }

  protected nextSlide(): void {
    this.scrollToSlide(this.activeSlide() + 1);
  }

  private parseDateMs(value: AppUser['createdAt']): number | null {
    if (!value) return null;
    if (typeof value === 'string') {
      const ms = Date.parse(value);
      return Number.isNaN(ms) ? null : ms;
    }
    if (typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
      return value.toMillis();
    }
    return null;
  }
}