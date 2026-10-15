import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BooleanDto,
  TicketDetail,
  TicketListDto,
  TicketListQuery,
  TicketStatus,
  TicketUpsertRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tickets`;

  list(query: TicketListQuery): Observable<TicketListDto> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('pageSize', String(query.pageSize ?? 10));

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.priority) {
      params = params.set('priority', query.priority);
    }
    if (query.agentId) {
      params = params.set('agentId', query.agentId);
    }
    if (query.overdueOnly) {
      params = params.set('overdueOnly', 'true');
    }

    return this.http.get<TicketListDto>(this.baseUrl, { params });
  }

  getById(id: string): Observable<TicketDetail> {
    return this.http.get<TicketDetail>(`${this.baseUrl}/${id}`);
  }

  create(request: TicketUpsertRequest): Observable<TicketDetail> {
    return this.http.post<TicketDetail>(this.baseUrl, request);
  }

  update(id: string, request: TicketUpsertRequest): Observable<TicketDetail> {
    return this.http.put<TicketDetail>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<BooleanDto> {
    return this.http.delete<BooleanDto>(`${this.baseUrl}/${id}`);
  }

  assign(id: string, agentId: string | null): Observable<TicketDetail> {
    return this.http.post<TicketDetail>(`${this.baseUrl}/${id}/assign`, { agentId });
  }

  changeStatus(id: string, status: TicketStatus): Observable<TicketDetail> {
    return this.http.post<TicketDetail>(`${this.baseUrl}/${id}/status`, { status });
  }

  addComment(id: string, request: { authorName: string; body: string }): Observable<TicketDetail> {
    return this.http.post<TicketDetail>(`${this.baseUrl}/${id}/comments`, request);
  }
}
