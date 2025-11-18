import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Login } from '@pages/login/login';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  breakpointObserver = inject(BreakpointObserver);
  dialog = inject(MatDialog);
  router = inject(Router);
  authService = inject(AuthService);

  currentUrl = signal(this.router.url);
  isHomePage = computed(() => this.currentUrl() === '/home' || this.currentUrl() === '/not-found');
  isMobile = signal(false);
  isMenuOpen = signal(false);
  isSidebarOpen = signal(false);

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.currentUrl.set(this.router.url);
    });
    this.breakpointObserver.observe([Breakpoints.Handset, '(max-width: 720px)'])
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
    // Emitir evento para o sidebar
    window.dispatchEvent(new CustomEvent('toggleSidebar'));
  }

  logout() {
    this.authService.logout();
  }

  openAccountDialog(signupMode: boolean): void {
    console.log('Abrindo diálogo de login/registro:', signupMode);
    this.dialog.open(Login, { data: signupMode, height: '80%', width: '45%' });
  }
}
