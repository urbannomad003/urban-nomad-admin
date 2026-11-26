import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Star, Upload, X } from 'lucide-angular';
import { NewProductService } from '../../../services/products-module/new-product/new-product.service';
import { ProductSection } from '../../../models/products/product.model';

@Component({
  selector: 'app-new-product-form',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './new-product-form.html',
})
export class NewProductForm {
  private readonly newProductService = inject(NewProductService);

  readonly created = output<void>();
  readonly cancelled = output<void>();

  protected readonly icons = { Plus, Star, Upload, X };
  protected readonly starValues = [1, 2, 3, 4, 5];

  protected readonly sections: { value: ProductSection; label: string }[] = [
    { value: 'FEATURED_PRODUCTS_ON_SALE', label: 'Featured Products On Sale' },
    { value: 'TRENDING_NOW', label: 'Trending Now' },
    { value: 'CLEARANCE_SALE', label: 'Clearance Sale' },
  ];

  protected title = '';
  protected color = '';
  protected price: number | null = null;
  protected discountedPrice: number | null = null;
  protected isDiscounted = false;
  protected rating: number | null = 5;
  protected section: ProductSection = 'FEATURED_PRODUCTS_ON_SALE';
  protected inStock = false;
  protected stockCount: number | null = 0;

  protected selectedFile: File | null = null;
  protected previewUrl = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected get isOutOfStock(): boolean {
    return Math.max(0, Number(this.stockCount ?? 0)) === 0;
  }

  protected onStockCountChange(value: number | string | null): void {
    const previousStock = Math.max(0, Number(this.stockCount ?? 0));
    const parsed =
      value === null || value === undefined || String(value).trim() === ''
        ? 0
        : Math.max(0, Number(value) || 0);

    this.stockCount = parsed;

    if (parsed === 0) {
      this.inStock = false;
    } else if (previousStock === 0 && parsed >= 1) {
      this.inStock = true;
    }
  }

  protected setRating(value: number): void {
    this.rating = value;
  }

  protected clearRating(): void {
    this.rating = null;
  }

  protected onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0] ?? null;

    const currentPreview = this.previewUrl();
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
    }

    this.selectedFile = file;
    this.previewUrl.set(file ? URL.createObjectURL(file) : null);
  }

  protected clearFile(): void {
    const currentPreview = this.previewUrl();
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview);
    }
    this.selectedFile = null;
    this.previewUrl.set(null);
  }

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.title.trim() || !this.color.trim()) {
      this.errorMessage.set('Title and color are required.');
      return;
    }

    const basePrice = Number(this.price);
    if (this.price == null || String(this.price).trim() === '' || Number.isNaN(basePrice) || basePrice <= 0) {
      this.errorMessage.set('Please enter a valid base price greater than 0.');
      return;
    }

    if (this.isDiscounted) {
      const hasDiscountInput =
        this.discountedPrice !== null &&
        this.discountedPrice !== undefined &&
        String(this.discountedPrice).trim() !== '';
      const discountVal = Number(this.discountedPrice);

      if (!hasDiscountInput || Number.isNaN(discountVal) || discountVal <= 0) {
        this.errorMessage.set('Please enter a discount price greater than 0 before submitting.');
        return;
      }

      if (discountVal > basePrice) {
        this.errorMessage.set('Discounted price cannot be greater than base price.');
        return;
      }
    }

    if (this.rating !== null && this.rating !== undefined && String(this.rating).trim() !== '') {
      const numRating = Number(this.rating);
      if (Number.isNaN(numRating) || numRating < 0 || numRating > 5) {
        this.errorMessage.set('Star rating must be between 0 and 5.');
        return;
      }
    }

    if (!this.selectedFile) {
      this.errorMessage.set('Please select a product image.');
      return;
    }

    const normalizedStock = Math.max(0, Number(this.stockCount ?? 0));
    const effectiveInStock = normalizedStock > 0 ? Boolean(this.inStock) : false;

    this.isSubmitting.set(true);

    try {
      await this.newProductService.createProduct(
        {
          title: this.title,
          color: this.color,
          price: basePrice,
          discountedPrice:
            this.isDiscounted &&
            this.discountedPrice != null &&
            String(this.discountedPrice).trim() !== ''
              ? Number(this.discountedPrice)
              : undefined,
          isDiscounted: this.isDiscounted,
          rating:
            this.rating !== null && this.rating !== undefined && String(this.rating).trim() !== ''
              ? Number(this.rating)
              : null,
          section: this.section,
          inStock: effectiveInStock,
          stockCount: normalizedStock,
        },
        this.selectedFile,
      );

      this.successMessage.set('Product created successfully.');
      this.resetForm();
      this.created.emit();
    } catch {
      this.errorMessage.set('Failed to create product. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetForm(): void {
    this.title = '';
    this.color = '';
    this.price = null;
    this.discountedPrice = null;
    this.isDiscounted = false;
    this.rating = 5;
    this.section = 'FEATURED_PRODUCTS_ON_SALE';
    this.inStock = false;
    this.stockCount = 0;
    this.clearFile();
  }
}