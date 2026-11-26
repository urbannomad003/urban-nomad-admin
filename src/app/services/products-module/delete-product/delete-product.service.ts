import { Injectable, inject } from '@angular/core';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { Product } from '../../../models/products/product.model';

@Injectable({
  providedIn: 'root',
})
export class DeleteProductService {
  private readonly firestore = inject(Firestore);
  private readonly cloudinary = inject(CloudinaryService);

  async deleteProduct(product: Product): Promise<void> {
    if (!product.productId) {
      throw new Error('Cannot delete product without a productId.');
    }

    try {
      if (product.imageUrl) {
        await this.cloudinary.deleteImage(product.imageUrl);
      }
      await deleteDoc(doc(this.firestore, 'products', product.productId));
    } catch (error) {
      console.error('[DeleteProductService] Delete failed:', error);
      throw error;
    }
  }
}