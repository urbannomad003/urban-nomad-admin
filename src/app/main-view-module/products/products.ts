import { Component, signal } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { NewProductForm } from '../../components/products-module/new-product-form/new-product-form';
import { EditProductForm } from '../../components/products-module/edit-product-form/edit-product-form';
import { DeleteProductForm } from '../../components/products-module/delete-product-form/delete-product-form';
import { ProductsListWidget } from '../../components/products-module/products-list-widget/products-list-widget';
import { Product } from '../../models/products/product.model';

@Component({
  selector: 'app-products',
  imports: [
    LucideAngularModule,
    NewProductForm,
    EditProductForm,
    DeleteProductForm,
    ProductsListWidget,
  ],
  templateUrl: './products.html',
})
export class Products {
  protected readonly icons = { Plus };

  protected readonly isAddModalOpen = signal(false);
  protected readonly editingProduct = signal<Product | null>(null);
  protected readonly deletingProduct = signal<Product | null>(null);

  protected openAddModal(): void {
    this.editingProduct.set(null);
    this.deletingProduct.set(null);
    this.isAddModalOpen.set(true);
  }

  protected onStartEdit(product: Product): void {
    this.isAddModalOpen.set(false);
    this.deletingProduct.set(null);
    this.editingProduct.set(product);
  }

  protected onStartDelete(product: Product): void {
    this.isAddModalOpen.set(false);
    this.editingProduct.set(null);
    this.deletingProduct.set(product);
  }

  protected closeAllModals(): void {
    this.isAddModalOpen.set(false);
    this.editingProduct.set(null);
    this.deletingProduct.set(null);
  }
}