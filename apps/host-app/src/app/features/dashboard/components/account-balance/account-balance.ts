import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DashboardFacade } from '../../dashboard.facade';

@Component({
  selector: 'app-account-balance',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './account-balance.html',
  styleUrl: './account-balance.scss',
  providers: [CurrencyPipe, DatePipe],
})
export class AccountBalance implements OnInit {
  facade = inject(DashboardFacade);

  balance$ = this.facade.balance$;
  loading$ = this.facade.balanceLoading$;
  showBalance = true;

  ngOnInit(): void {
    this.facade.loadBalance();
  }

  toggleBalanceVisibility(): void {
    this.showBalance = !this.showBalance;
  }

  get formattedCurrentDate(): string {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
