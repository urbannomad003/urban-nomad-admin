import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyMembers } from './loyalty-members';

describe('LoyaltyMembers', () => {
  let component: LoyaltyMembers;
  let fixture: ComponentFixture<LoyaltyMembers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyMembers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyMembers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
