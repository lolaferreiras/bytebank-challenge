import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransactionModal } from './edit-transaction-modal';

describe('EditTransactionModalComponent', () => {
  let component: EditTransactionModal;
  let fixture: ComponentFixture<EditTransactionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTransactionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTransactionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
