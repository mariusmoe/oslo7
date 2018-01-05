import { TestBed, inject } from '@angular/core/testing';

import { OsloService } from './oslo.service';

describe('OsloService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OsloService]
    });
  });

  it('should be created', inject([OsloService], (service: OsloService) => {
    expect(service).toBeTruthy();
  }));
});
