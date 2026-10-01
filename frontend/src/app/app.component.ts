import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { FooterComponent } from './components/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="app-layout">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent {}
