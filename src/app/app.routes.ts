import { Routes } from '@angular/router';
import { AgentFormComponent } from './features/agents/agent-form.component';
import { AgentListComponent } from './features/agents/agent-list.component';
import { TicketDetailComponent } from './features/tickets/ticket-detail.component';
import { TicketFormComponent } from './features/tickets/ticket-form.component';
import { TicketListComponent } from './features/tickets/ticket-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  { path: 'tickets', component: TicketListComponent },
  { path: 'tickets/new', component: TicketFormComponent },
  { path: 'tickets/:id', component: TicketDetailComponent },
  { path: 'tickets/:id/edit', component: TicketFormComponent },
  { path: 'agents', component: AgentListComponent },
  { path: 'agents/new', component: AgentFormComponent },
  { path: 'agents/:id/edit', component: AgentFormComponent },
  { path: '**', redirectTo: 'tickets' },
];
