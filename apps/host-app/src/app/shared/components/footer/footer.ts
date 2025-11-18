import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  breakpointObserver = inject(BreakpointObserver);
  isMobile = signal(false);

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset, '(max-width: 720px)'])
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
  }
}
