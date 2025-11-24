import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { GetBalanceUseCase } from '@bytebank-challenge/application';
import { loadBalance } from './state/actions';
import { selectBalance, selectBalanceLoading } from './state/selectors';

/**
 * Facade para o módulo de Dashboard
 * Centraliza toda a lógica de negócio relacionada ao saldo e resumo da conta
 * Simplifica o uso nos componentes, escondendo a complexidade do NgRx
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardFacade {
  private store = inject(Store);
  private getBalanceUseCase = inject(GetBalanceUseCase);

  // Selectors públicos - Estado observável
  balance$ = this.store.select(selectBalance);
  balanceLoading$ = this.store.select(selectBalanceLoading);

  /**
   * Carrega o saldo da conta do usuário
   * Dispara a action que iniciará o fluxo de busca do saldo
   */
  loadBalance(): void {
    this.store.dispatch(loadBalance());
  }

  /**
   * Obtém o saldo diretamente (sem passar pelo state)
   * Útil para situações onde você precisa do valor imediatamente
   * @returns Observable com a resposta do saldo
   */
  getBalanceDirect(): Observable<unknown> {
    return this.getBalanceUseCase.execute();
  }

  /**
   * Formata o valor do saldo para exibição
   * @param balance Valor do saldo
   * @returns String formatada em Real brasileiro
   */
  formatBalance(balance: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(balance);
  }

  /**
   * Verifica se o saldo está negativo
   * @param balance Valor do saldo
   * @returns true se o saldo for negativo
   */
  isNegativeBalance(balance: number): boolean {
    return balance < 0;
  }

  /**
   * Retorna uma mensagem apropriada baseada no saldo
   * @param balance Valor do saldo
   * @returns Mensagem contextual
   */
  getBalanceMessage(balance: number): string {
    if (balance > 10000) {
      return 'Excelente! Seu saldo está saudável.';
    } else if (balance > 1000) {
      return 'Bom trabalho mantendo suas finanças.';
    } else if (balance > 0) {
      return 'Continue atento aos seus gastos.';
    } else {
      return 'Atenção: Seu saldo está negativo.';
    }
  }
}
