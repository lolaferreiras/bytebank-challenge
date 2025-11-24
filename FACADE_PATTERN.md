# 🎭 Facade Pattern - Feature Modules

## 📋 O que é o Facade Pattern?

O **Facade Pattern** é um padrão de design que fornece uma interface simplificada para um sistema complexo. No contexto da nossa aplicação Angular com NgRx, as facades encapsulam:

- **State Management** (NgRx Store, Actions, Selectors)
- **Use Cases** (Application Layer)
- **Lógica de negócio** complexa
- **Métodos utilitários** comuns

## 🎯 Benefícios

### 1. **Simplificação**
Os componentes não precisam saber sobre:
- Actions do NgRx
- Selectors complexos
- Múltiplos use cases injetados
- Lógica de state management

### 2. **Centralização**
Toda a lógica de uma feature em um único lugar:
- Facilita manutenção
- Reduz duplicação de código
- Melhora testabilidade

### 3. **Desacoplamento**
Componentes dependem apenas da facade:
- Fácil trocar implementação interna
- Isola mudanças no state management
- Componentes mais limpos

### 4. **Reusabilidade**
Métodos utilitários compartilhados:
- Formatação de dados
- Validações
- Operações comuns

## 🏗️ Estrutura Implementada

```
features/
├── transactions/
│   ├── transactions.facade.ts       ✅ Facade principal
│   ├── components/
│   ├── pages/
│   ├── state/
│   └── examples/
│       └── transactions-example.component.ts
│
└── dashboard/
    ├── dashboard.facade.ts           ✅ Facade principal
    ├── components/
    ├── pages/
    ├── state/
    └── examples/
        └── dashboard-example.component.ts
```

## 📚 Facades Criadas

### 1. **TransactionsFacade**

#### Funcionalidades:
- ✅ Gerenciamento de transações (CRUD)
- ✅ Upload/Download de anexos
- ✅ Sugestões de categoria
- ✅ Paginação e filtros
- ✅ State observável (transactions$, status$, totalItems$)

#### Métodos Principais:
```typescript
// Carregar transações
facade.loadTransactions(page, limit, sort, order)

// CRUD
facade.createTransaction(transaction, file?)
facade.updateTransaction(id, transaction, file?)
facade.deleteTransaction(id)

// Anexos
facade.uploadAttachment(transactionId, file)
facade.downloadAttachment(filename)
facade.downloadFile(blob, filename) // Utilitário

// Sugestões
facade.getCategorySuggestions(description, type)
```

### 2. **DashboardFacade**

#### Funcionalidades:
- ✅ Gerenciamento de saldo
- ✅ Formatação de valores
- ✅ Validações de saldo
- ✅ Mensagens contextuais
- ✅ State observável (balance$, balanceLoading$)

#### Métodos Principais:
```typescript
// Carregar saldo
facade.loadBalance()
facade.getBalanceDirect() // Sem state management

// Utilitários
facade.formatBalance(balance)
facade.isNegativeBalance(balance)
facade.getBalanceMessage(balance)
```

## 🔧 Como Usar

### ❌ **ANTES** (Sem Facade)

```typescript
@Component({...})
export class ExtractComponent {
  private store = inject(Store);
  private getAllUseCase = inject(GetAllTransactionsUseCase);
  private createUseCase = inject(CreateTransactionUseCase);
  private updateUseCase = inject(UpdateTransactionUseCase);
  private deleteUseCase = inject(DeleteTransactionUseCase);
  private downloadUseCase = inject(DownloadAttachmentUseCase);
  
  transactions$ = this.store.select(selectTransactions);
  totalItems$ = this.store.select(selectTotalItems);
  status$ = this.store.select(selectStatus);
  
  loadTransactions() {
    this.store.dispatch(TransactionsActions.loadTransactions({
      page: 1, limit: 10, sort: 'date', order: 'desc'
    }));
  }
  
  createTransaction(transaction: Partial<Transaction>) {
    this.store.dispatch(TransactionsActions.createTransaction({
      transaction, file: null
    }));
  }
  
  // ... muitos mais métodos e injeções
}
```

### ✅ **DEPOIS** (Com Facade)

```typescript
@Component({...})
export class ExtractComponent {
  // Uma única injeção
  facade = inject(TransactionsFacade);
  
  // State já exposto pela facade
  transactions$ = this.facade.transactions$;
  totalItems$ = this.facade.totalItems$;
  status$ = this.facade.status$;
  
  loadTransactions() {
    // Interface simples
    this.facade.loadTransactions(1, 10);
  }
  
  createTransaction(transaction: Partial<Transaction>) {
    // Sem precisar saber do NgRx
    this.facade.createTransaction(transaction);
  }
}
```

## 📖 Exemplos de Uso

### Exemplo 1: Carregar e Exibir Transações

```typescript
@Component({
  selector: 'app-transactions-list',
  template: `
    <div *ngIf="facade.status$ | async as status">
      <div *ngIf="status === 'loading'">Carregando...</div>
      
      <ul *ngIf="status === 'success'">
        <li *ngFor="let t of facade.transactions$ | async">
          {{ t.description }} - {{ t.amount }}
        </li>
      </ul>
      
      <div *ngIf="status === 'error'">Erro ao carregar</div>
    </div>
  `
})
export class TransactionsListComponent implements OnInit {
  facade = inject(TransactionsFacade);
  
  ngOnInit() {
    this.facade.loadTransactions();
  }
}
```

### Exemplo 2: Criar Nova Transação

```typescript
@Component({...})
export class NewTransactionComponent {
  facade = inject(TransactionsFacade);
  
  onSubmit(formData: Partial<Transaction>, file?: File) {
    this.facade.createTransaction(formData, file);
  }
}
```

### Exemplo 3: Download de Anexo

```typescript
@Component({...})
export class TransactionItemComponent {
  facade = inject(TransactionsFacade);
  
  downloadAttachment(filename: string, originalName: string) {
    this.facade.downloadAttachment(filename).subscribe({
      next: (blob) => {
        // Método utilitário facilita o download
        this.facade.downloadFile(blob, originalName);
      },
      error: (err) => console.error('Erro:', err)
    });
  }
}
```

### Exemplo 4: Exibir Saldo

```typescript
@Component({
  selector: 'app-balance-card',
  template: `
    <div *ngIf="facade.balance$ | async as balance">
      <h3>Saldo Atual</h3>
      <p [class.negative]="facade.isNegativeBalance(balance)">
        {{ facade.formatBalance(balance) }}
      </p>
      <p>{{ facade.getBalanceMessage(balance) }}</p>
    </div>
  `
})
export class BalanceCardComponent implements OnInit {
  facade = inject(DashboardFacade);
  
  ngOnInit() {
    this.facade.loadBalance();
  }
}
```

## 🧪 Testando com Facades

### Teste de Componente

```typescript
describe('TransactionsListComponent', () => {
  let component: TransactionsListComponent;
  let facade: jasmine.SpyObj<TransactionsFacade>;
  
  beforeEach(() => {
    // Mock apenas da facade
    const facadeSpy = jasmine.createSpyObj('TransactionsFacade', [
      'loadTransactions'
    ]);
    
    facadeSpy.transactions$ = of([]);
    facadeSpy.status$ = of('success');
    
    TestBed.configureTestingModule({
      providers: [
        { provide: TransactionsFacade, useValue: facadeSpy }
      ]
    });
    
    facade = TestBed.inject(TransactionsFacade) as jasmine.SpyObj<TransactionsFacade>;
    component = TestBed.createComponent(TransactionsListComponent).componentInstance;
  });
  
  it('should load transactions on init', () => {
    component.ngOnInit();
    expect(facade.loadTransactions).toHaveBeenCalled();
  });
});
```

## 🎓 Boas Práticas

### ✅ DO

- Use facades em todos os componentes
- Mantenha facades focadas em uma feature
- Adicione métodos utilitários comuns na facade
- Documente os métodos públicos
- Mantenha a facade stateless (use Store para estado)

### ❌ DON'T

- Não injete Store e Use Cases diretamente nos componentes
- Não coloque lógica de UI na facade
- Não misture responsabilidades de diferentes features
- Não faça facades muito genéricas
- Não duplique lógica entre facades

## 📊 Comparação

| Aspecto | Sem Facade | Com Facade |
|---------|-----------|------------|
| **Injeções** | 5-10+ dependências | 1 dependência |
| **Complexidade** | Alta | Baixa |
| **Testabilidade** | Difícil | Fácil |
| **Manutenibilidade** | Difícil | Fácil |
| **Acoplamento** | Alto | Baixo |
| **Reusabilidade** | Baixa | Alta |

## 🚀 Próximos Passos

1. **Migrar componentes existentes** para usar as facades
2. **Adicionar testes unitários** para as facades
3. **Criar facades** para outras features (auth, profile, etc)
4. **Documentar** métodos específicos de cada facade
5. **Criar interceptors** ou middleware se necessário

## 📝 Conclusão

O Facade Pattern simplifica drasticamente o código dos componentes, tornando-os:
- **Mais limpos** e focados na apresentação
- **Mais fáceis de testar** com um único mock
- **Mais manuteníveis** com lógica centralizada
- **Mais reutilizáveis** com métodos compartilhados

As facades são a **camada de abstração perfeita** entre componentes e a lógica de negócio complexa!
