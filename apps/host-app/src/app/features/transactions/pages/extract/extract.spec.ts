import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Extract } from './extract';

describe('Extract', () => {
  let component: Extract;
  let fixture: ComponentFixture<Extract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Extract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Extract);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 