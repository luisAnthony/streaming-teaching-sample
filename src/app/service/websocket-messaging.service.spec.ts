import { TestBed } from '@angular/core/testing';

import { WsMessagingService } from './websocket-messaging.service';

describe('WebRtcMessagingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WsMessagingService = TestBed.get(WsMessagingService);
    expect(service).toBeTruthy();
  });
});
