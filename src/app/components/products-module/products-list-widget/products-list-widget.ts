import { Component, OnDestroy, OnInit, computed, inject, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  LucideAngularModule,
  Package,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
  X,
} from 'lucide-angular';
import { ProductsListService } from '../../../services/products-module/products-list/products-list.service';
import { Product, ProductSection } from '../../../models/products/product.model';

export type SortField = 'createdAt' | 'price' | 'name';
export type SortDirection = 'asc' | 'desc';
export type SectionFilter = 'ALL' | ProductSection;

interface ProductFilters {
  minPrice: number | null;
  maxPrice: number | null;
  minStock: number | null;
  maxStock: number | null;
  section: SectionFilter;
}

const DEFAULT_FILTERS: ProductFilters = {
  minPrice: null,
  maxPrice: null,
  minStock: null,
  maxStock: null,
  section: 'ALL',
};

@Component({
  selector: 'app-products-list-widget',
  imports: [DecimalPipe, FormsModule, LucideAngularModule],
  templateUrl: './products-list-widget.html',
})
export class ProductsListWidget implements OnInit, OnDestroy {
  private readonly productsListService = inject(ProductsListService);
  private subscription?: Subscription;

  readonly editProduct = output<Product>();
  readonly deleteProduct = output<Product>();

  protected readonly icons = {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    Filter,
    Package,
    Pencil,
    RotateCcw,
    Star,
    Trash2,
    X,
  };

  protected readonly starValues = [1, 2, 3, 4, 5];

  protected readonly sectionOptions: { value: SectionFilter; label: string }[] = [
    { value: 'ALL', label: 'All Sections' },
    { value: 'FEATURED_PRODUCTS_ON_SALE', label: 'Featured On Sale' },
    { value: 'TRENDING_NOW', label: 'Trending Now' },
    { value: 'CLEARANCE_SALE', label: 'Clearance Sale' },
  ];

  protected readonly pageSizeOptions = [5, 10, 20, 50];

  protected readonly products = signal<Product[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly sortField = signal<SortField>('createdAt');
  protected readonly sortDirection = signal<SortDirection>('desc');

  protected readonly appliedFilters = signal<ProductFilters>({ ...DEFAULT_FILTERS });
  protected readonly isFilterModalOpen = signal(false);

  protected draftMinPrice: number | null = null;
  protected draftMaxPrice: number | null = null;
  protected draftMinStock: number | null = null;
  protected draftMaxStock: number | null = null;
  protected draftSection: SectionFilter = 'ALL';

  protected readonly pageSize = signal<number>(10);
  protected readonly currentPage = signal<number>(1);

  protected readonly activeFilterCount = computed(() => {
    const f = this.appliedFilters();
    let count = 0;
    if (f.minPrice !== null) count++;
    if (f.maxPrice !== null) count++;
    if (f.minStock !== null) count++;
    if (f.maxStock !== null) count++;
    if (f.section !== 'ALL') count++;
    return count;
  });

  protected readonly filteredAndSortedProducts = computed(() => {
    const f = this.appliedFilters();
    const field = this.sortField();
    const dir = this.sortDirection();
    const multiplier = dir === 'asc' ? 1 : -1;

    const filtered = this.products().filter((item) => {
      const effectivePrice = this.getEffectivePrice(item);
      const stock = Number(item.stockCount ?? 0);

      if (f.section !== 'ALL' && item.section !== f.section) {
        return false;
      }
      if (f.minPrice !== null && effectivePrice < f.minPrice) {
        return false;
      }
      if (f.maxPrice !== null && effectivePrice > f.maxPrice) {
        return false;
      }
      if (f.minStock !== null && stock < f.minStock) {
        return false;
      }
      if (f.maxStock !== null && stock > f.maxStock) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (field === 'price') {
        const diff = this.getEffectivePrice(a) - this.getEffectivePrice(b);
        return diff * multiplier;
      }

      if (field === 'name') {
        const nameA = (a.title ?? '').toLowerCase();
        const nameB = (b.title ?? '').toLowerCase();
        return nameA.localeCompare(nameB) * multiplier;
      }

      const timeA = Date.parse(a.createdAt ?? '') || 0;
      const timeB = Date.parse(b.createdAt ?? '') || 0;
      return (timeA - timeB) * multiplier;
    });
  });

  protected readonly totalPages = computed(() => {
    const total = this.filteredAndSortedProducts().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  protected readonly paginatedProducts = computed(() => {
    const list = this.filteredAndSortedProducts();
    const size = this.pageSize();
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  protected readonly rangeStart = computed(() => {
    const total = this.filteredAndSortedProducts().length;
    if (total === 0) return 0;
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    return (page - 1) * this.pageSize() + 1;
  });

  protected readonly rangeEnd = computed(() => {
    const total = this.filteredAndSortedProducts().length;
    if (total === 0) return 0;
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    return Math.min(total, page * this.pageSize());
  });

  ngOnInit(): void {
    this.subscription = this.productsListService.getProductsLive().subscribe({
      next: (items) => {
        this.products.set(items);
        this.errorMessage.set(null);
        this.isLoading.set(false);
        this.clampPage();
      },
      error: (err) => {
        console.error('[ProductsListWidget] Stream error:', err);
        this.errorMessage.set('Failed to load products from Firestore.');
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected getEffectivePrice(item: Product): number {
    if (item.isDiscounted && item.discountedPrice != null) {
      return Number(item.discountedPrice);
    }
    return Number(item.price ?? 0);
  }

  protected onSortFieldChange(field: SortField): void {
    this.sortField.set(field);
    this.currentPage.set(1);
  }

  protected toggleSortDirection(): void {
    this.sortDirection.update((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    this.currentPage.set(1);
  }

  protected openFilterModal(): void {
    const current = this.appliedFilters();
    this.draftMinPrice = current.minPrice;
    this.draftMaxPrice = current.maxPrice;
    this.draftMinStock = current.minStock;
    this.draftMaxStock = current.maxStock;
    this.draftSection = current.section;
    this.isFilterModalOpen.set(true);
  }

  protected closeFilterModal(): void {
    this.isFilterModalOpen.set(false);
  }

  protected applyFilters(): void {
    this.appliedFilters.set({
      minPrice: this.normalizeNumber(this.draftMinPrice),
      maxPrice: this.normalizeNumber(this.draftMaxPrice),
      minStock: this.normalizeNumber(this.draftMinStock),
      maxStock: this.normalizeNumber(this.draftMaxStock),
      section: this.draftSection,
    });
    this.currentPage.set(1);
    this.isFilterModalOpen.set(false);
  }

  protected resetDraftFilters(): void {
    this.draftMinPrice = null;
    this.draftMaxPrice = null;
    this.draftMinStock = null;
    this.draftMaxStock = null;
    this.draftSection = 'ALL';
  }

  protected clearAllFilters(): void {
    this.appliedFilters.set({ ...DEFAULT_FILTERS });
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

  private normalizeNumber(val: number | string | null | undefined): number | null {
    if (val === null || val === undefined || String(val).trim() === '') {
      return null;
    }
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  }

  protected formatSection(section: Product['section']): string {
    switch (section) {
      case 'FEATURED_PRODUCTS_ON_SALE':
        return 'Featured On Sale';
      case 'TRENDING_NOW':
        return 'Trending Now';
      case 'CLEARANCE_SALE':
        return 'Clearance Sale';
    }
  }
}