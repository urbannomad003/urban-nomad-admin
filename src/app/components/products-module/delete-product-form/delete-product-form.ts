import { Component, inject, input, output, signal } from '@angular/core';
import { LucideAngularModule, Trash2, X } from 'lucide-angular';
import { DeleteProductService } from '../../../services/products-module/delete-product/delete-product.service';
import { Product } from '../../../models/products/product.model';

@Component({
  selector: 'app-delete-product-form',
  imports: [LucideAngularModule],
  templateUrl: './delete-product-form.html',
})
export class DeleteProductForm {
  private readonly deleteProductService = inject(DeleteProductService);

  readonly product = input<Product | null>(null);
  readonly deleted = output<void>();
  readonly cancelled = output<void>();

  protected readonly icons = { Trash2, X };
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected async confirmDelete(): Promise<void> {
    const target = this.product();
    if (!target?.productId) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    try {
      await this.deleteProductService.deleteProduct(target);
      this.deleted.emit();
    } catch {
      this.errorMessage.set('Failed to delete product. Please try again.');
    } finally {
      this.isDeleting.set(false);
    }
  }
}