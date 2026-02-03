import { TestBed } from '@angular/core/testing';

import { ModalHandler } from './modal-handler';

describe('ModalHandler', () => {
  let service: ModalHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
