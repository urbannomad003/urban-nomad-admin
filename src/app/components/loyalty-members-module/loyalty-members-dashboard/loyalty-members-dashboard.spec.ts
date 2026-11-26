import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyMembersDashboard } from './loyalty-members-dashboard';

describe('LoyaltyMembersDashboard', () => {
  let component: LoyaltyMembersDashboard;
  let fixture: ComponentFixture<LoyaltyMembersDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyMembersDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyMembersDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
