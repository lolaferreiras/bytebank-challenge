import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AccountBalance } from '../../components/account-balance/account-balance';
import { TransactionExtract } from '../../../transactions/components/transaction-extract/transaction-extract';
import { NewTransaction } from '../../../transactions/components/new-transaction/new-transaction';
import { UserService } from '../../../../core/services/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatIconModule, 
    AccountBalance, 
    TransactionExtract, 
    NewTransaction
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  username: string | null = inject(UserService).loggedInUser?.username ?? null;

  get greeting(): string {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Bom dia';
    if (currentHour < 18) return 'Boa tarde';
    return 'Boa noite';
  }
}
