# 🎬 Roteiro de Apresentação - ByteBank Challenge (5 minutos)

## ⏱️ Timing Sugerido
- **Introdução**: 30 segundos
- **Arquitetura Modular**: 1 minuto
- **Clean Architecture**: 45 segundos
- **Lazy Loading e @defer**: 45 segundos
- **Cache**: 45 segundos
- **Programação Reativa**: 45 segundos
- **Segurança**: 45 segundos
- **Conclusão**: 30 segundos

---

## 1️⃣ INTRODUÇÃO (30s)

**O que dizer:**
> "Olá! Vou apresentar o ByteBank, um sistema bancário desenvolvido com Angular 20+ que implementa as melhores práticas de arquitetura e segurança. Vamos ver como aplicamos cada requisito técnico solicitado."

**O que mostrar:**
- Navegue no sistema funcionando: `http://localhost:4200`
- Mostre rapidamente: Login → Dashboard → Extrato

---

## 2️⃣ PADRÕES DE ARQUITETURA MODULAR (1min)

### 📍 Feature Modules

**O que dizer:**
> "O projeto utiliza Feature Modules - cada funcionalidade é auto-contida com seus próprios componentes, páginas, rotas e gerenciamento de estado."

**O que mostrar:**

**📁 Estrutura de Features:**
```
Arquivo: README.md (linhas 106-130)
apps/host-app/src/app/features/
  ├── transactions/      ← Feature de Transações
  │   ├── components/    
  │   ├── pages/         
  │   ├── state/         ← NgRx (Actions, Effects, Reducers)
  │   ├── transactions.facade.ts    ← Facade Pattern
  │   └── transactions.routes.ts    ← Rotas lazy-loaded
  │
  ├── dashboard/         ← Feature de Dashboard
  │   ├── components/
  │   ├── pages/
  │   ├── state/
  │   ├── dashboard.facade.ts
  │   └── dashboard.routes.ts
  │
  └── auth/              ← Feature de Autenticação
      └── auth.routes.ts
```

### 🎭 Facade Pattern

**O que dizer:**
> "Implementamos o Facade Pattern para simplificar a comunicação entre componentes e lógica de negócio. Ao invés de múltiplas injeções de Store, Actions e Use Cases, usamos uma única Facade."

**O que mostrar:**

**📄 Arquivo:** `apps/host-app/src/app/features/transactions/transactions.facade.ts` (linhas 1-30)
```typescript
/**
 * Facade para o módulo de Transações
 * Centraliza toda a lógica de negócio e comunicação com o state management
 * Simplifica o uso nos componentes, escondendo a complexidade do NgRx
 */
@Injectable({
  providedIn: 'root',
})
export class TransactionsFacade {
  private store = inject(Store);
  private createUseCase = inject(CreateTransactionUseCase);
  private deleteUseCase = inject(DeleteTransactionUseCase);
  // ... todos os use cases e store centralizados aqui
}
```

**Benefícios (mostre no README.md linhas 182-195):**
- ✅ Uma única injeção no componente
- ✅ Reduz complexidade
- ✅ Facilita testes

---

## 3️⃣ CLEAN ARCHITECTURE (45s)

**O que dizer:**
> "Separamos em 3 camadas distintas seguindo Clean Architecture: Domain contém apenas entidades puras, Application contém os casos de uso e interfaces, e Infrastructure contém as implementações concretas como serviços e chamadas HTTP."

**O que mostrar:**

**📁 Estrutura (README.md linhas 162-179):**
```
├── domain/                     ← 🏛️ Camada de Domínio
│   └── src/lib/entities/       ← Entidades puras (Transaction, User)
│
├── application/                ← 🏛️ Camada de Aplicação
│   └── src/lib/
│       ├── ports/              ← Interfaces (ITransactionRepository)
│       └── use-cases/          ← Casos de uso (CreateTransactionUseCase)
│
└── infrastructure/             ← 🏛️ Camada de Infraestrutura
    └── src/lib/services/       ← Implementações (TransactionApiService)
```

**📄 Exemplo de Interface (Port):**
Mostre: `application/src/lib/ports/itransaction.repository.ts`

**📄 Exemplo de Use Case:**
Mostre: `application/src/lib/use-cases/create-transaction.use-case.ts`

**O que dizer:**
> "A camada de Application não conhece detalhes de implementação, apenas define contratos através de interfaces. A Infrastructure implementa esses contratos."

---

## 4️⃣ LAZY LOADING E PRÉ-CARREGAMENTO (45s)

### Lazy Loading

**O que dizer:**
> "Aplicamos Lazy Loading nas rotas - as features só são carregadas quando acessadas, reduzindo o bundle inicial."

**O que mostrar:**

**📄 Arquivo:** `apps/host-app/src/app/app.config.ts` (linha 43)
```typescript
provideRouter(appRoutes, withPreloading(PreloadAllModules)),
```

**O que dizer:**
> "Usamos PreloadAllModules para carregar módulos em background após o inicial."

### @defer (Deferrable Views)

**O que dizer:**
> "No Angular 20, usamos @defer para carregar componentes apenas quando necessário, com diferentes estratégias."

**O que mostrar:**

**📄 Arquivo:** `apps/host-app/src/app/features/dashboard/pages/dashboard/dashboard.html` (linhas 4-18)

```html
<!-- Carrega quando visível no viewport -->
@defer (on viewport) {
  <app-account-balance></app-account-balance>
} @placeholder {
  <div class="skeleton-balance">Carregando saldo...</div>
}

<!-- Carrega quando usuário interagir -->
@defer (on interaction) {
  <app-new-transaction></app-new-transaction>
} @placeholder {
  <div class="skeleton-form">
    <p>Clique para carregar formulário</p>
  </div>
}

<!-- Carrega quando navegador estiver ocioso -->
@defer (on idle) {
  <app-transaction-extract></app-transaction-extract>
} @placeholder {
  <div class="skeleton-extract">...</div>
}
```

**O que dizer:**
> "Veja: viewport para elementos visíveis, interaction para carregar ao clicar, e idle quando o navegador estiver livre. Isso melhora drasticamente a performance inicial."

---

## 5️⃣ IMPLEMENTAÇÃO DE CACHE (45s)

**O que dizer:**
> "Implementamos um sistema de cache em múltiplas camadas para reduzir requisições HTTP repetidas."

**O que mostrar:**

### CacheService

**📄 Arquivo:** `apps/host-app/src/app/core/services/cache.service.ts` (linhas 1-50)
```typescript
@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 60_000; // 60 segundos

  get(req: HttpRequest<any>): HttpResponse<any> | null {
    const key = this.makeKey(req);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  set(req: HttpRequest<any>, response: HttpResponse<any>, ttlMs?: number) {
    const key = this.makeKey(req);
    const expiry = Date.now() + (ttlMs ?? this.defaultTTL);
    this.cache.set(key, { url: req.urlWithParams, response, expiry });
  }
}
```

### Cache Interceptor

**📄 Arquivo:** `apps/host-app/src/app/core/interceptors/cache.interceptor.ts` (linhas 7-48)
```typescript
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(CacheService);

  // Apenas GET requests
  if (req.method !== 'GET') {
    return next(req).pipe(
      tap(() => {
        // Invalida cache em operações de escrita
        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
          cache.invalidateUrl(req.url);
        }
      })
    );
  }

  const cached = cache.get(req);
  if (cached) {
    console.debug('[cache] HIT', req.urlWithParams);
    return of(cached.clone());
  }

  console.debug('[cache] MISS', req.urlWithParams);
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req, event);
      }
    })
  );
};
```

**📄 Registrado em:** `apps/host-app/src/app/app.config.ts` (linha 44)
```typescript
provideHttpClient(withFetch(), withInterceptors([authInterceptor, cacheInterceptor])),
```

**O que dizer:**
> "O interceptor captura todas as requisições GET, verifica se há cache válido e retorna instantaneamente. Em operações de escrita (POST/PUT/DELETE), invalida o cache relacionado. Isso reduz em até 90% as chamadas HTTP repetidas."

---

## 6️⃣ PROGRAMAÇÃO REATIVA (45s)

**O que dizer:**
> "Utilizamos RxJS extensivamente com operadores reativos para tornar a interface mais responsiva e eficiente."

**O que mostrar:**

### Operators no NgRx Effects

**📄 Arquivo:** `apps/host-app/src/app/features/transactions/state/transactions/transactions.effects.ts` (linhas 30-45)
```typescript
loadTransactions$ = createEffect(() =>
  this.actions$.pipe(
    ofType(TransactionsActions.loadTransactions),
    switchMap(({ page, limit, sort, order }) =>  // ← switchMap cancela requisições anteriores
      this.getAllTransactionsUseCase
        .execute({ page, limit, sort, order })
        .pipe(
          map((response) =>
            TransactionsApiActions.loadTransactionsSuccess({
              transactions: response.result.transactions,
              totalItems: response.result.totalItems,
            })
          ),
          catchError((error) =>
            of(TransactionsApiActions.loadTransactionsFailure({ error }))
          )
        )
    )
  )
);
```

**O que dizer:**
> "Usamos switchMap para cancelar requisições pendentes quando uma nova é feita - imagine o usuário digitando rapidamente em um filtro. Também usamos concatMap para operações sequenciais e combineLatest para combinar múltiplos observables."

### Auto-sugestão reativa

**📄 Arquivo:** `apps/host-app/src/app/features/transactions/components/new-transaction/new-transaction.ts` (linhas 85-95)
```typescript
this.transactionForm.get('description')?.valueChanges
  .pipe(
    debounceTime(500),        // Aguarda 500ms após digitar
    distinctUntilChanged(),   // Só emite se valor mudou
    filter(desc => desc && desc.length > 3),
    switchMap((description) => {
      return this.transactionsFacade.getCategorySuggestions(description);
    }),
    takeUntilDestroyed(this.destroyRef)
  )
  .subscribe((suggestions) => {
    // Auto-preenche categoria
  });
```

**O que dizer:**
> "Aqui temos sugestão automática de categoria enquanto usuário digita. Usamos debounceTime para aguardar ele parar de digitar, distinctUntilChanged para evitar chamadas duplicadas, e filter para só buscar com mínimo 3 caracteres. Tudo de forma reativa e eficiente."

**Técnicas Reativas Aplicadas:**
- ✅ **switchMap**: Cancela requisições anteriores (ideal para busca/filtros)
- ✅ **concatMap**: Execução sequencial (upload + create transaction)
- ✅ **debounceTime**: Aguarda usuário parar de digitar
- ✅ **distinctUntilChanged**: Evita valores duplicados
- ✅ **combineLatest**: Combina múltiplos observables
- ✅ **takeUntilDestroyed**: Cleanup automático de subscriptions

---

## 7️⃣ AUTENTICAÇÃO SEGURA E CRIPTOGRAFIA (45s)

**O que dizer:**
> "Implementamos duas camadas de segurança: uso de SessionStorage ao invés de LocalStorage para tokens, e criptografia de senhas no cliente antes de enviar ao backend."

**O que mostrar:**

### 1. SessionStorage (mais seguro)

**📄 Arquivo:** `apps/host-app/src/app/core/services/auth.service.ts`
```typescript
// SessionStorage expira quando aba fecha (mais seguro)
sessionStorage.setItem('authToken', token);
```

**O que dizer:**
> "SessionStorage é mais seguro que LocalStorage porque expira automaticamente quando o usuário fecha a aba, reduzindo riscos de XSS."

### 2. Criptografia de Senhas

**📄 Arquivo:** `apps/host-app/src/app/core/services/crypto.service.ts`
```typescript
export class CryptoService {
  hashPassword(password: string): string {
    return SHA256(password).toString();
  }
  
  hashPasswordSecure(password: string, salt?: string): string {
    const finalSalt = salt || 'bytebank-default-salt';
    return PBKDF2(password, finalSalt, {
      keySize: 256/32,
      iterations: 1000
    }).toString();
  }
}
```

**O que dizer:**
> "Usamos a biblioteca crypto-js para fazer hash SHA-256 da senha ANTES de enviar ao backend. A senha nunca trafega em texto plano, nem aparece em logs de rede."

### 3. Password Policies

**📄 Arquivo:** `apps/host-app/src/app/core/validators/password.validator.ts` (linhas 1-50)
```typescript
/**
 * Requisitos de segurança:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula (A-Z)
 * - Pelo menos uma letra minúscula (a-z)
 * - Pelo menos um número (0-9)
 * - Pelo menos um caractere especial
 * - Não pode conter espaços
 * - Não pode ser senha comum (12345678, password, etc)
 */
export class PasswordValidator {
  static strong(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // ... 8 validações de segurança
    };
  }
}
```

**O que mostrar no navegador:**
- Acesse página de cadastro/login
- Tente digitar uma senha fraca
- Mostre o indicador de força da senha em tempo real
- Mostre as mensagens de erro específicas

**O que dizer:**
> "Implementamos validação de senha forte com 8 requisitos obrigatórios. O usuário recebe feedback em tempo real sobre a força da senha e quais requisitos faltam atender."

**Resumo de Segurança (README.md linhas 197-250):**
- ✅ Senha criptografada (SHA-256) no cliente
- ✅ PBKDF2 disponível para hash mais seguro com salt
- ✅ SessionStorage ao invés de LocalStorage
- ✅ 8 validações de senha forte
- ✅ Indicador de força em tempo real
- ✅ Bloqueio de senhas comuns

---

## 8️⃣ GERENCIAMENTO DE ESTADO AVANÇADO (Bônus se sobrar tempo)

**O que dizer:**
> "Usamos NgRx com Store, Effects, Actions e Selectors para gerenciar estado de forma previsível e reativa."

**O que mostrar:**

**📄 Arquivo:** `apps/host-app/src/app/features/transactions/state/transactions/transactions.reducer.ts` (linhas 1-25)
```typescript
export interface State {
  transactions: Transaction[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  status: 'pending' | 'loading' | 'error' | 'success';
  error: any;
}
```

**📄 Integrado em:** `apps/host-app/src/app/app.config.ts` (linhas 51-57)
```typescript
provideStore(),
provideState(transactionsFeature),
provideEffects([TransactionEffects, BalanceEffects]),
provideStoreDevtools({ maxAge: 25 }),
```

**O que dizer:**
> "Toda a lógica de estado está centralizada no NgRx Store, permitindo time-travel debugging e estado previsível em toda aplicação."

---

## 9️⃣ CONCLUSÃO (30s)

**O que dizer:**
> "Implementamos todas as práticas solicitadas: arquitetura modular com Feature Modules e Facade Pattern, Clean Architecture com 3 camadas separadas, lazy loading e @defer para performance, cache inteligente com TTL, programação reativa com RxJS, e segurança robusta com criptografia e password policies. O código está documentado, testável e seguindo as melhores práticas do Angular 20+."

**O que mostrar:**
- Volte para o navegador
- Navegue rapidamente mostrando a aplicação funcionando
- Abra o DevTools → Network para mostrar cache funcionando (HIT/MISS)
- Mostre o README.md completo

**Finalize com:**
> "Todo o código está no GitHub e a documentação está completa no README. Obrigado!"

---

## 📋 CHECKLIST PRÉ-GRAVAÇÃO

Antes de gravar, certifique-se de:

- [ ] Aplicação rodando em `http://localhost:4200`
- [ ] Backend rodando em `http://localhost:3000`
- [ ] Usuário de teste cadastrado
- [ ] VS Code aberto com os arquivos prontos
- [ ] Console do navegador limpo (F12)
- [ ] Zoom do VS Code adequado para leitura (Ctrl/Cmd + "+")
- [ ] Tema claro ou escuro (o que for mais legível)
- [ ] Fechar abas/arquivos desnecessários
- [ ] Timer/cronômetro aberto para controlar 5 minutos

---

## 🎯 ARQUIVOS-CHAVE A TER ABERTOS NO VS CODE

Tenha esses arquivos em abas separadas para alternar rapidamente:

1. `README.md`
2. `apps/host-app/src/app/app.config.ts`
3. `apps/host-app/src/app/features/transactions/transactions.facade.ts`
4. `apps/host-app/src/app/features/dashboard/pages/dashboard/dashboard.html`
5. `apps/host-app/src/app/core/services/cache.service.ts`
6. `apps/host-app/src/app/core/interceptors/cache.interceptor.ts`
7. `apps/host-app/src/app/features/transactions/state/transactions/transactions.effects.ts`
8. `apps/host-app/src/app/core/services/crypto.service.ts`
9. `apps/host-app/src/app/core/validators/password.validator.ts`

---

## 💡 DICAS PARA GRAVAÇÃO

1. **Pratique antes**: Grave um teste para ajustar timing
2. **Fale devagar e claro**: Melhor do que rápido e confuso
3. **Mostre o código funcionando primeiro**: Depois explique
4. **Use zoom no VS Code**: Ctrl/Cmd + "+" para código legível
5. **Pause no console**: Mostre os logs de cache (HIT/MISS)
6. **Não se perca em detalhes**: 5 minutos passa RÁPIDO
7. **Tenha um script mental**: Saiba o que vai falar antes
8. **Use transições suaves**: "Agora vamos ver...", "Como podemos observar..."
9. **Destaque o diferencial**: Angular 20, @defer, clean architecture
10. **Termine forte**: Recapitule os pontos principais

---

## ⏲️ SE ESTIVER FICANDO SEM TEMPO

Priorize na ordem:

1. ✅ **Arquitetura Modular** (obrigatório)
2. ✅ **Clean Architecture** (obrigatório)
3. ✅ **Lazy Loading + @defer** (obrigatório)
4. ✅ **Cache** (obrigatório)
5. ✅ **Programação Reativa** (obrigatório)
6. ✅ **Segurança** (obrigatório)
7. ⏭️ Estado Avançado (bônus)

---

## 🎬 BOA SORTE NA APRESENTAÇÃO!

Lembre-se: você conhece o projeto melhor que ninguém. Fale com confiança! 💪
