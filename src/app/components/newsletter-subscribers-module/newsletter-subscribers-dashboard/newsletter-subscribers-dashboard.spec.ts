import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterSubscribersDashboard } from './newsletter-subscribers-dashboard';

describe('NewsletterSubscribersDashboard', () => {
  let component: NewsletterSubscribersDashboard;
  let fixture: ComponentFixture<NewsletterSubscribersDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterSubscribersDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsletterSubscribersDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
