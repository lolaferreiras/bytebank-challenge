import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionExtract } from './transaction-extract';

describe('TransactionExtract', () => {
  let component: TransactionExtract;
  let fixture: ComponentFixture<TransactionExtract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionExtract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionExtract);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
