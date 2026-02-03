import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDisplay } from './modal-display';

describe('ModalDisplay', () => {
  let component: ModalDisplay;
  let fixture: ComponentFixture<ModalDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
