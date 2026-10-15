import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen">
      <header class="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a routerLink="/tickets" class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">SD</span>
            <span>
              <span class="block text-sm font-semibold text-slate-900">Support Desk</span>
            </span>
          </a>
          <nav class="flex items-center gap-2 text-sm">
            <a
              routerLink="/tickets"
              routerLinkActive="bg-slate-100 text-slate-900"
              class="rounded-xl px-3 py-2 font-medium text-slate-600 hover:bg-slate-50"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              Tickets
            </a>
            <a
              routerLink="/agents"
              routerLinkActive="bg-slate-100 text-slate-900"
              class="rounded-xl px-3 py-2 font-medium text-slate-600 hover:bg-slate-50"
            >
              Agents
            </a>
          </nav>
        </div>
      </header>
      <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {}
