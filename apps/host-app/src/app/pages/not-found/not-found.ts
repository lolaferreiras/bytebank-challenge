import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from '@shared/components/footer/footer';
import { Navbar } from '@shared/components/navbar/navbar';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule, 
    Footer, 
    Navbar,
    RouterModule,
    NgOptimizedImage
  ],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss'
})
export class NotFound {

}
