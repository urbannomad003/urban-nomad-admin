import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, Star, Upload, X } from 'lucide-angular';
import { EditProductService } from '../../../services/products-module/edit-product/edit-product.service';
import { Product, ProductSection } from '../../../models/products/product.model';

@Component({
  selector: 'app-edit-product-form',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './edit-product-form.html',
})
export class EditProductForm {
  private readonly editProductService = inject(EditProductService);

  readonly product = input<Product | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly icons = { Save, Star, Upload, X };
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
  protected rating: number | null = null;
  protected section: ProductSection = 'FEATURED_PRODUCTS_ON_SALE';
  protected inStock = true;
  protected stockCount: number | null = 0;
  protected imageUrl = '';
  protected newImageFile: File | null = null;
  protected previewUrl = signal<string | null>(null);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const current = this.product();
      this.errorMessage.set(null);
      this.clearNewImage();

      if (current) {
        const currentStock = Math.max(0, Number(current.stockCount ?? 0));
        this.title = current.title ?? '';
        this.color = current.color ?? '';
        this.price = current.price ?? null;
        this.discountedPrice = current.discountedPrice ?? null;
        this.isDiscounted = Boolean(current.isDiscounted);
        this.rating = current.rating ?? null;
        this.section = current.section ?? 'FEATURED_PRODUCTS_ON_SALE';
        this.stockCount = currentStock;
        this.inStock = currentStock > 0 ? Boolean(current.inStock) : false;
        this.imageUrl = current.imageUrl ?? '';
      }
    });
  }

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
    this.setNewImage(file);
  }

  private setNewImage(file: File | null): void {
    const existingPreview = this.previewUrl();
    if (existingPreview) {
      URL.revokeObjectURL(existingPreview);
    }

    this.newImageFile = file;
    this.previewUrl.set(file ? URL.createObjectURL(file) : null);
  }

  protected clearNewImage(): void {
    this.setNewImage(null);
  }

  protected async onSubmit(): Promise<void> {
    const current = this.product();
    if (!current) {
      return;
    }

    this.errorMessage.set(null);

    if (!current.productId) {
      this.errorMessage.set('Missing product ID. Unable to update this product.');
      return;
    }

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

    const normalizedStock = Math.max(0, Number(this.stockCount ?? 0));
    const effectiveInStock = normalizedStock > 0 ? Boolean(this.inStock) : false;

    this.isSaving.set(true);

    try {
      await this.editProductService.updateProduct(
        {
          productId: current.productId,
          title: this.title,
          color: this.color,
          price: basePrice,
          discountedPrice: this.discountedPrice,
          isDiscounted: this.isDiscounted,
          rating:
            this.rating !== null && this.rating !== undefined && String(this.rating).trim() !== ''
              ? Number(this.rating)
              : null,
          section: this.section,
          inStock: effectiveInStock,
          stockCount: normalizedStock,
          existingImageUrl: this.imageUrl,
        },
        this.newImageFile,
      );

      this.saved.emit();
    } catch {
      this.errorMessage.set('Failed to update product. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
}