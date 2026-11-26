import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersListWidget } from './users-list-widget';

describe('UsersListWidget', () => {
  let component: UsersListWidget;
  let fixture: ComponentFixture<UsersListWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersListWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersListWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
