export type Department = 'Technical' | 'Billing' | 'General';
export type Priority = 'Low' | 'Normal' | 'High' | 'Critical';
export type TicketStatus = 'New' | 'InProgress' | 'Resolved' | 'Closed';

export interface BooleanDto {
  success: boolean;
  message: string;
}

export interface Agent extends BooleanDto {
  id: string;
  fullName: string;
  email: string;
  department: Department;
  isActive: boolean;
}

export interface AgentListItem {
  id: string;
  fullName: string;
  email: string;
  department: Department;
  isActive: boolean;
}

export interface AgentListDto extends BooleanDto {
  items: AgentListItem[];
}

export interface AgentUpsertRequest {
  fullName: string;
  email: string;
  department: Department;
}

export interface Comment {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface TicketListItem {
  id: string;
  reference: string;
  title: string;
  customerName: string;
  priority: Priority;
  status: TicketStatus;
  agentId: string | null;
  agentName: string | null;
  dueAt: string;
  createdAt: string;
  isOverdue: boolean;
}

export interface TicketDetail extends BooleanDto {
  id: string;
  reference: string;
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  priority: Priority;
  status: TicketStatus;
  agentId: string | null;
  agentName: string | null;
  createdAt: string;
  lastModifiedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  dueAt: string;
  isOverdue: boolean;
  allowedStatusTargets: TicketStatus[];
  comments: Comment[];
}

export interface TicketListDto extends BooleanDto {
  items: TicketListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TicketListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TicketStatus | '';
  priority?: Priority | '';
  agentId?: string | '';
  overdueOnly?: boolean;
}

export interface TicketUpsertRequest {
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  priority: Priority;
}

export interface ApiProblem {
  title?: string;
  detail?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}
