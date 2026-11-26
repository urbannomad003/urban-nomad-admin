import { Injectable, NgZone, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  onSnapshot,
  query,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../../../models/products/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsListService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  async getProducts(): Promise<Product[]> {
    const snapshot = await getDocs(collection(this.firestore, 'products'));
    return snapshot.docs.map(
      (d) =>
        ({
          productId: d.id,
          ...d.data(),
        }) as Product,
    );
  }

  getProductsLive(): Observable<Product[]> {
    return new Observable<Product[]>((observer) => {
      const q = query(collection(this.firestore, 'products'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const products: Product[] = snapshot.docs.map(
            (d) =>
              ({
                productId: d.id,
                ...d.data(),
              }) as Product,
          );
          this.ngZone.run(() => observer.next(products));
        },
        (error) => {
          this.ngZone.run(() => observer.error(error));
        },
      );
      return () => unsubscribe();
    });
  }
}