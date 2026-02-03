import { TestBed } from '@angular/core/testing';

import { FeedbackHandler } from './feedback-handler';

describe('FeedbackHandler', () => {
  let service: FeedbackHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedbackHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
