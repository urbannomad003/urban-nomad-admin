export type ProductSection =
  | 'FEATURED_PRODUCTS_ON_SALE'
  | 'TRENDING_NOW'
  | 'CLEARANCE_SALE';

export interface Product {
  productId?: string;
  title: string;
  color: string;
  price: number;
  initialPrice?: number;
  discountedPrice?: number;
  isDiscounted: boolean;
  rating?: number;
  section: ProductSection;
  inStock: boolean;
  stockCount: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}