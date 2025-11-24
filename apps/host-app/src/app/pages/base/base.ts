import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './base.html',
  styleUrl: './base.scss'
})
export class Base {

}
