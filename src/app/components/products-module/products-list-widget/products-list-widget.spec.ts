import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsListWidget } from './products-list-widget';

describe('ProductsListWidget', () => {
  let component: ProductsListWidget;
  let fixture: ComponentFixture<ProductsListWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsListWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
