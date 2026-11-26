import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyMembersListWidget } from './loyalty-members-list-widget';

describe('LoyaltyMembersListWidget', () => {
  let component: LoyaltyMembersListWidget;
  let fixture: ComponentFixture<LoyaltyMembersListWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyMembersListWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyMembersListWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
