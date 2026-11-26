import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { Product, ProductSection } from '../../../models/products/product.model';

export interface NewProductInput {
  title: string;
  color: string;
  price: number;
  discountedPrice?: number;
  isDiscounted: boolean;
  rating?: number | null;
  section: ProductSection;
  inStock: boolean;
  stockCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class NewProductService {
  private readonly firestore = inject(Firestore);
  private readonly cloudinary = inject(CloudinaryService);
  private readonly envInjector = inject(EnvironmentInjector);

  async createProduct(input: NewProductInput, imageFile: File): Promise<string> {
    try {
      const imageUrl = await this.cloudinary.uploadImage(imageFile);
      const now = new Date().toISOString();
      const stockCount = Math.max(0, Number(input.stockCount) || 0);
      const isDiscounted = Boolean(input.isDiscounted);
      const price = Number(input.price) || 0;

      const parsedDiscounted =
        isDiscounted &&
        input.discountedPrice != null &&
        !Number.isNaN(Number(input.discountedPrice))
          ? Number(input.discountedPrice)
          : undefined;

      const hasRating =
        input.rating !== undefined &&
        input.rating !== null &&
        String(input.rating).trim() !== '' &&
        !Number.isNaN(Number(input.rating));

      const clampedRating = hasRating
        ? Math.min(5, Math.max(0, Number(input.rating)))
        : undefined;

      const finalProduct: Omit<Product, 'productId'> = {
        title: input.title.trim(),
        color: input.color.trim(),
        price,
        isDiscounted,
        section: input.section,
        stockCount,
        inStock: stockCount > 0 ? Boolean(input.inStock) : false,
        imageUrl,
        createdAt: now,
        updatedAt: now,
      };

      if (isDiscounted && parsedDiscounted !== undefined) {
        finalProduct.discountedPrice = parsedDiscounted;
        finalProduct.initialPrice = price;
      }

      if (clampedRating !== undefined) {
        finalProduct.rating = clampedRating;
      }

      const sanitizedProduct = Object.fromEntries(
        Object.entries(finalProduct).filter(([, value]) => value !== undefined),
      );

      const docRef = await runInInjectionContext(this.envInjector, () =>
        addDoc(collection(this.firestore, 'products'), sanitizedProduct),
      );
      return docRef.id;
    } catch (error) {
      console.error('[NewProductService] Create failed:', error);
      throw error;
    }
  }
}