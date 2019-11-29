import { TestBed } from '@angular/core/testing';

import { VideostreamRecorderService } from './videostream-recorder.service';

describe('VideostreamRecorderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VideostreamRecorderService = TestBed.get(VideostreamRecorderService);
    expect(service).toBeTruthy();
  });
});
