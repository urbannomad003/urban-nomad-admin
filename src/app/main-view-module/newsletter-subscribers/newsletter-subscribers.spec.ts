import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterSubscribers } from './newsletter-subscribers';

describe('NewsletterSubscribers', () => {
  let component: NewsletterSubscribers;
  let fixture: ComponentFixture<NewsletterSubscribers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterSubscribers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsletterSubscribers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
