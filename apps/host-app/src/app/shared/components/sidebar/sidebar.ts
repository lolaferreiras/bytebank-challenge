import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatListModule, MatButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit, OnDestroy {
  authService = inject(AuthService);
  isOpen = true;
  isMobile = false;

  ngOnInit() {
    this.checkScreenSize();
    this.setupEventListeners();
  }

  ngOnDestroy() {
    this.removeEventListeners();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;

    // Se mudou de desktop para mobile, fecha o sidebar
    if (!wasMobile && this.isMobile) {
      this.isOpen = false;
    }
    // Se mudou de mobile para desktop, abre o sidebar
    else if (wasMobile && !this.isMobile) {
      this.isOpen = true;
    }
  }

  private setupEventListeners() {
    window.addEventListener('toggleSidebar', this.handleToggleSidebar.bind(this));
  }

  private removeEventListeners() {
    window.removeEventListener('toggleSidebar', this.handleToggleSidebar.bind(this));
  }

  private handleToggleSidebar() {
    this.toggleSidebar();
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.isOpen = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}
