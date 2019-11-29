import { TestBed, inject } from '@angular/core/testing';

import { JwtStorageService } from './jwt-storage.service';

describe('JwtStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JwtStorageService]
    });
  });

  it('should be created', inject([JwtStorageService], (service: JwtStorageService) => {
    expect(service).toBeTruthy();
  }));
});
