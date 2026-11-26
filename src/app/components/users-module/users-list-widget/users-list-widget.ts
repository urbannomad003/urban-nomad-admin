import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  LucideAngularModule,
  RotateCcw,
  Users,
  X,
} from 'lucide-angular';
import { UsersListService } from '../../../services/users-module/users-list/users-list.service';
import { AppUser } from '../../../models/users';

export type UserSortField = 'createdAt' | 'name' | 'email' | 'lastLoginAt';
export type SortDirection = 'asc' | 'desc';
export type LoyaltyFilter = 'ALL' | 'MEMBER' | 'NON_MEMBER';
export type VerifiedFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED';

interface UserFilters {
  loyalty: LoyaltyFilter;
  verified: VerifiedFilter;
  provider: string;
  createdFrom: string;
  createdTo: string;
}

const DEFAULT_USER_FILTERS: UserFilters = {
  loyalty: 'ALL',
  verified: 'ALL',
  provider: 'ALL',
  createdFrom: '',
  createdTo: '',
};

@Component({
  selector: 'app-users-list-widget',
  imports: [DatePipe, FormsModule, LucideAngularModule],
  templateUrl: './users-list-widget.html',
})
export class UsersListWidget implements OnInit, OnDestroy {
  private readonly usersListService = inject(UsersListService);
  private subscription?: Subscription;

  protected readonly icons = {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    Filter,
    RotateCcw,
    Users,
    X,
  };

  protected readonly pageSizeOptions = [5, 10, 20, 50];

  protected readonly users = signal<AppUser[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly sortField = signal<UserSortField>('createdAt');
  protected readonly sortDirection = signal<SortDirection>('desc');

  protected readonly appliedFilters = signal<UserFilters>({ ...DEFAULT_USER_FILTERS });
  protected readonly isFilterModalOpen = signal(false);

  protected draftLoyalty: LoyaltyFilter = 'ALL';
  protected draftVerified: VerifiedFilter = 'ALL';
  protected draftProvider = 'ALL';
  protected draftCreatedFrom = '';
  protected draftCreatedTo = '';

  protected readonly pageSize = signal<number>(10);
  protected readonly currentPage = signal<number>(1);

  protected readonly availableProviders = computed(() => {
    const set = new Set<string>();
    for (const user of this.users()) {
      if (user.provider && user.provider.trim()) {
        set.add(user.provider.trim());
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  protected readonly activeFilterCount = computed(() => {
    const f = this.appliedFilters();
    let count = 0;
    if (f.loyalty !== 'ALL') count++;
    if (f.verified !== 'ALL') count++;
    if (f.provider !== 'ALL') count++;
    if (f.createdFrom.trim() !== '') count++;
    if (f.createdTo.trim() !== '') count++;
    return count;
  });

  protected readonly filteredAndSortedUsers = computed(() => {
    const f = this.appliedFilters();
    const field = this.sortField();
    const dir = this.sortDirection();
    const multiplier = dir === 'asc' ? 1 : -1;

    const fromMs = f.createdFrom ? Date.parse(`${f.createdFrom}T00:00:00.000Z`) : null;
    const toMs = f.createdTo ? Date.parse(`${f.createdTo}T23:59:59.999Z`) : null;

    const filtered = this.users().filter((user) => {
      if (f.loyalty === 'MEMBER' && !user.isLoyaltyMember) return false;
      if (f.loyalty === 'NON_MEMBER' && user.isLoyaltyMember) return false;

      if (f.verified === 'VERIFIED' && !user.emailVerified) return false;
      if (f.verified === 'UNVERIFIED' && user.emailVerified) return false;

      if (f.provider !== 'ALL' && (user.provider ?? '').trim() !== f.provider) {
        return false;
      }

      if (fromMs !== null && !Number.isNaN(fromMs)) {
        const createdMs = this.parseDateMs(user.createdAt);
        if (createdMs === null || createdMs < fromMs) return false;
      }

      if (toMs !== null && !Number.isNaN(toMs)) {
        const createdMs = this.parseDateMs(user.createdAt);
        if (createdMs === null || createdMs > toMs) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (field === 'name') {
        const nameA = this.getDisplayName(a).toLowerCase();
        const nameB = this.getDisplayName(b).toLowerCase();
        return nameA.localeCompare(nameB) * multiplier;
      }

      if (field === 'email') {
        const emailA = this.getDisplayEmail(a).toLowerCase();
        const emailB = this.getDisplayEmail(b).toLowerCase();
        return emailA.localeCompare(emailB) * multiplier;
      }

      if (field === 'lastLoginAt') {
        const loginA = this.parseDateMs(a.lastLoginAt) ?? 0;
        const loginB = this.parseDateMs(b.lastLoginAt) ?? 0;
        return (loginA - loginB) * multiplier;
      }

      const createdA = this.parseDateMs(a.createdAt) ?? 0;
      const createdB = this.parseDateMs(b.createdAt) ?? 0;
      return (createdA - createdB) * multiplier;
    });
  });

  protected readonly totalPages = computed(() => {
    const total = this.filteredAndSortedUsers().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  protected readonly paginatedUsers = computed(() => {
    const list = this.filteredAndSortedUsers();
    const size = this.pageSize();
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  protected readonly rangeStart = computed(() => {
    const total = this.filteredAndSortedUsers().length;
    if (total === 0) return 0;
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    return (page - 1) * this.pageSize() + 1;
  });

  protected readonly rangeEnd = computed(() => {
    const total = this.filteredAndSortedUsers().length;
    if (total === 0) return 0;
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    return Math.min(total, page * this.pageSize());
  });

  ngOnInit(): void {
    this.subscription = this.usersListService.getUsersLive().subscribe({
      next: (items) => {
        this.users.set(items);
        this.errorMessage.set(null);
        this.isLoading.set(false);
        this.clampPage();
      },
      error: (err) => {
        console.error('[UsersListWidget] Stream error:', err);
        this.errorMessage.set('Failed to load users from Firestore.');
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected getDisplayName(user: AppUser): string {
    const base =
      user.fullName?.trim() ||
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      'Unnamed User';
    return user.title ? `${user.title} ${base}` : base;
  }

  protected getDisplayEmail(user: AppUser): string {
    return user.email?.trim() || user.emailAddress?.trim() || '—';
  }

  protected getInitials(user: AppUser): string {
    const first = user.firstName?.trim()?.[0] ?? user.fullName?.trim()?.[0] ?? 'U';
    const last = user.lastName?.trim()?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  protected toDate(value: AppUser['createdAt'] | AppUser['lastLoginAt']): Date | null {
    const ms = this.parseDateMs(value);
    return ms !== null ? new Date(ms) : null;
  }

  protected onSortFieldChange(field: UserSortField): void {
    this.sortField.set(field);
    this.currentPage.set(1);
  }

  protected toggleSortDirection(): void {
    this.sortDirection.update((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    this.currentPage.set(1);
  }

  protected openFilterModal(): void {
    const current = this.appliedFilters();
    this.draftLoyalty = current.loyalty;
    this.draftVerified = current.verified;
    this.draftProvider = current.provider;
    this.draftCreatedFrom = current.createdFrom;
    this.draftCreatedTo = current.createdTo;
    this.isFilterModalOpen.set(true);
  }

  protected closeFilterModal(): void {
    this.isFilterModalOpen.set(false);
  }

  protected applyFilters(): void {
    this.appliedFilters.set({
      loyalty: this.draftLoyalty,
      verified: this.draftVerified,
      provider: this.draftProvider,
      createdFrom: this.draftCreatedFrom,
      createdTo: this.draftCreatedTo,
    });
    this.currentPage.set(1);
    this.isFilterModalOpen.set(false);
  }

  protected resetDraftFilters(): void {
    this.draftLoyalty = 'ALL';
    this.draftVerified = 'ALL';
    this.draftProvider = 'ALL';
    this.draftCreatedFrom = '';
    this.draftCreatedTo = '';
  }

  protected clearAllFilters(): void {
    this.appliedFilters.set({ ...DEFAULT_USER_FILTERS });
    this.resetDraftFilters();
    this.currentPage.set(1);
  }

  protected onPageSizeChange(value: number | string): void {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed > 0) {
      this.pageSize.set(parsed);
      this.currentPage.set(1);
    }
  }

  protected goToPage(page: number): void {
    const target = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(target);
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  private clampPage(): void {
    const maxPage = this.totalPages();
    if (this.currentPage() > maxPage) {
      this.currentPage.set(maxPage);
    }
  }

  private parseDateMs(value: AppUser['createdAt'] | AppUser['lastLoginAt']): number | null {
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