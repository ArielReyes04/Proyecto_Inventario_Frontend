import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-navbar></app-navbar>
      
      <div class="flex pt-16 h-screen">
        <app-sidebar></app-sidebar>
        
        <main class="ml-64 flex-1 p-8 overflow-y-auto mb-14 relative w-full h-full">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-footer></app-footer>
    </div>
  `
})
export class LayoutComponent {}
