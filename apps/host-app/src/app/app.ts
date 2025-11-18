import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SkipLinksComponent } from './shared/components/skip-links/skip-links';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    SkipLinksComponent
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
}
