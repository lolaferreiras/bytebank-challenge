import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Login } from '../login/login';
import { Footer } from '../../shared/components/footer/footer';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    Footer,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule, 
    MatIconModule,
    MatInputModule, 
    ReactiveFormsModule,
    Navbar,
    NgOptimizedImage
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  breakpointObserver = inject(BreakpointObserver);
  dialog = inject(MatDialog);
  isMobile = signal(false);

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset, '(max-width: 720px)'])
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });
  }

  openAccountDialog(signupMode: boolean): void {
    this.dialog.open(Login, { data: signupMode, height: '80%', width: '45%' });
  }
}
