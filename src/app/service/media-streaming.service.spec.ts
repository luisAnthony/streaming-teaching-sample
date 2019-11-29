import { TestBed } from '@angular/core/testing';

import { MediaStreamingService } from './media-streaming.service';

describe('MediaStreamingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MediaStreamingService = TestBed.get(MediaStreamingService);
    expect(service).toBeTruthy();
  });
});
