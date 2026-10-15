import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Agent, AgentListDto, AgentUpsertRequest, BooleanDto } from './models';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/agents`;

  list(search?: string): Observable<AgentListDto> {
    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<AgentListDto>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Agent> {
    return this.http.get<Agent>(`${this.baseUrl}/${id}`);
  }

  create(request: AgentUpsertRequest & { isActive?: boolean }): Observable<Agent> {
    return this.http.post<Agent>(this.baseUrl, request);
  }

  update(id: string, request: AgentUpsertRequest): Observable<Agent> {
    return this.http.put<Agent>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<BooleanDto> {
    return this.http.delete<BooleanDto>(`${this.baseUrl}/${id}`);
  }

  setActive(id: string, isActive: boolean): Observable<Agent> {
    return this.http.post<Agent>(`${this.baseUrl}/${id}/active`, { isActive });
  }
}
