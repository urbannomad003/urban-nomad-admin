import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Firestore, doc, updateDoc, deleteField } from '@angular/fire/firestore';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { ProductSection } from '../../../models/products/product.model';

export interface EditProductInput {
  productId: string;
  title: string;
  color: string;
  price: number;
  discountedPrice?: number | null;
  isDiscounted: boolean;
  rating?: number | null;
  section: ProductSection;
  inStock: boolean;
  stockCount: number;
  existingImageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class EditProductService {
  private readonly firestore = inject(Firestore);
  private readonly cloudinary = inject(CloudinaryService);
  private readonly envInjector = inject(EnvironmentInjector);

  async updateProduct(input: EditProductInput, newImageFile?: File | null): Promise<void> {
    try {
      let imageUrl = input.existingImageUrl;

      if (newImageFile) {
        imageUrl = await this.cloudinary.uploadImage(newImageFile);
      }

      const now = new Date().toISOString();
      const stockCount = Math.max(0, Number(input.stockCount) || 0);
      const isDiscounted = Boolean(input.isDiscounted);
      const price = Number(input.price) || 0;

      const hasDiscountedPrice =
        input.discountedPrice !== undefined &&
        input.discountedPrice !== null &&
        String(input.discountedPrice).trim() !== '' &&
        !Number.isNaN(Number(input.discountedPrice));

      const hasRating =
        input.rating !== undefined &&
        input.rating !== null &&
        String(input.rating).trim() !== '' &&
        !Number.isNaN(Number(input.rating));

      const rawPayload: Record<string, unknown> = {
        title: input.title.trim(),
        color: input.color.trim(),
        price,
        isDiscounted,
        section: input.section,
        stockCount,
        inStock: stockCount > 0 ? Boolean(input.inStock) : false,
        imageUrl,
        updatedAt: now,
      };

      if (isDiscounted && hasDiscountedPrice) {
        rawPayload['discountedPrice'] = Number(input.discountedPrice);
        rawPayload['initialPrice'] = price;
      } else {
        rawPayload['discountedPrice'] = deleteField();
        rawPayload['initialPrice'] = deleteField();
      }

      if (hasRating) {
        rawPayload['rating'] = Math.min(5, Math.max(0, Number(input.rating)));
      } else {
        rawPayload['rating'] = deleteField();
      }

      const sanitizedPayload = Object.fromEntries(
        Object.entries(rawPayload).filter(([, value]) => value !== undefined),
      );

      await runInInjectionContext(this.envInjector, () => {
        const productDocRef = doc(this.firestore, 'products', input.productId);
        return updateDoc(productDocRef, sanitizedPayload);
      });
    } catch (error) {
      console.error('[EditProductService] Update failed:', error);
      throw error;
    }
  }
}