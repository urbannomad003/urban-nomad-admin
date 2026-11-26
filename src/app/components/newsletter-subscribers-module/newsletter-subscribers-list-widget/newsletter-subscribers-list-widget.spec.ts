import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterSubscribersListWidget } from './newsletter-subscribers-list-widget';

describe('NewsletterSubscribersListWidget', () => {
  let component: NewsletterSubscribersListWidget;
  let fixture: ComponentFixture<NewsletterSubscribersListWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterSubscribersListWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsletterSubscribersListWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
