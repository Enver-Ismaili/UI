import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TicketService } from './ticket.service';
import { environment } from '../../environments/environment';

describe('TicketService', () => {
  let service: TicketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('builds list query params for search filters and overdueOnly', () => {
    service
      .list({
        page: 2,
        pageSize: 10,
        search: 'login',
        status: 'New',
        priority: 'High',
        agentId: '11111111-1111-1111-1111-111111111111',
        overdueOnly: true,
      })
      .subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${environment.apiUrl}/tickets` &&
        request.params.get('page') === '2' &&
        request.params.get('pageSize') === '10' &&
        request.params.get('search') === 'login' &&
        request.params.get('status') === 'New' &&
        request.params.get('priority') === 'High' &&
        request.params.get('agentId') === '11111111-1111-1111-1111-111111111111' &&
        request.params.get('overdueOnly') === 'true',
    );

    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'OK', items: [], totalCount: 0, page: 2, pageSize: 10 });
  });
});
