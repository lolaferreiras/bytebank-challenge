import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalance } from './account-balance';

describe('AccountBalance', () => {
  let component: AccountBalance;
  let fixture: ComponentFixture<AccountBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountBalance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountBalance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
