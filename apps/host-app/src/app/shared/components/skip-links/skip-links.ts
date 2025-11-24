import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ACCESSIBILITY_CONFIG, SkipLink } from '../../utils/accessibility.config';
import { AccessibilityService } from '../../services/accessibility.service';

@Component({
  selector: 'app-skip-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skip-links.html',
  styleUrls: ['./skip-links.scss']
})
export class SkipLinksComponent implements OnInit {
  skipLinks: SkipLink[] = [];
  private accessibilityService = inject(AccessibilityService);

  ngOnInit() {
    this.skipLinks = ACCESSIBILITY_CONFIG.skipLinks;
  }

  focusTarget(targetId: string) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.focus();
      this.accessibilityService.announce(`Foco movido para ${targetElement.textContent || targetId}`);
    }
  }
} 