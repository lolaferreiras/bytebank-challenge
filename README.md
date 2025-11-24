# ByteBank | FIAP Challenge - Frontend

Um sistema para gerenciamento bancário desenvolvido com arquitetura de microfrontends usando Angular e Module Federation.

## 🚀 Tecnologias

- **Angular 20+** - Framework principal
- **Nx Workspace** - Gerenciamento de monorepo
- **Module Federation** - Arquitetura de microfrontends
- **TypeScript** - Linguagem de programação
- **SCSS** - Pré-processador CSS
- **Docker** - Containerização
- **Nginx** - Servidor web para produção

## 🏗️ Arquitetura de Microfrontends

O projeto utiliza **Module Federation** para implementar uma arquitetura de microfrontends:

### Aplicações

1. **Host App** (`host-app`)
   - Aplicação principal que atua como shell
   - Gerencia o roteamento principal
   - Carrega os microfrontends remotos
   - Porta: `4200`

2. **Resume Account MF** (`resume-account-mf`)
   - Microfrontend responsável pelo resumo de conta
   - Funcionalidades de dashboard e visualização de dados
   - Carregado dinamicamente pelo Host App
   - Porta: `4201`

## 🛠️ Como Executar

### Pré-requisitos

Para executar o projeto completo, você precisa do **repositório do backend**:

📁 **Backend Repository**: [bytebank-backend](https://github.com/GiovannaMelo/bytebank-backend)

Clone o repositório do backend em uma pasta separada:
```bash
git clone https://github.com/GiovannaMelo/bytebank-backend.git
```

### Desenvolvimento Local

#### Frontend (apenas microfrontends):
Para executar todos os microfrontends simultaneamente:

```bash
npm run serve:all
```

Este comando irá:
- Iniciar o Host App na porta `4200`
- Iniciar o Resume Account MF na porta `4201`
- Configurar automaticamente a comunicação entre os microfrontends

Acesse a aplicação em: http://localhost:4200

#### Backend (executar separadamente):
No repositório do backend:
```bash
cd bytebank-backend
npm install
npm start
```

O backend ficará disponível em: http://localhost:3000

### Docker (Stack Completa)

Para executar todo o sistema (frontend + backend + banco) via Docker:

#### 1. Configure o caminho do backend no docker-compose.yml:
Ajuste a linha `context` no serviço `backend-api` para apontar para o caminho correto do seu repositório backend.

#### 2. Subir todos os serviços:
```bash
docker compose up --build
```

#### 3. Derrubar todos os serviços:
```bash
docker compose down
```

#### Serviços disponíveis no Docker:
- **Frontend Host**: http://localhost:4200
- **Microfrontend**: http://localhost:4201
- **Backend API**: http://localhost:3000
- **MongoDB**: localhost:27017

## 📁 Estrutura do Projeto

O projeto segue **Clean Architecture** e **Feature Modules** para melhor organização e manutenibilidade:

```
bytebank-challenge/
├── apps/
│   ├── host-app/                           # Aplicação principal
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── features/              # 🎯 Módulos por Feature
│   │   │   │   │   ├── transactions/      # Feature de Transações
│   │   │   │   │   │   ├── components/    # Componentes da feature
│   │   │   │   │   │   │   ├── new-transaction/
│   │   │   │   │   │   │   ├── edit-transaction-modal/
│   │   │   │   │   │   │   ├── transaction-extract/
│   │   │   │   │   │   │   └── confirm-delete-dialog/
│   │   │   │   │   │   ├── pages/         # Páginas da feature
│   │   │   │   │   │   │   └── extract/
│   │   │   │   │   │   ├── state/         # NgRx State (Actions, Effects, Reducers)
│   │   │   │   │   │   │   └── transactions/
│   │   │   │   │   │   ├── transactions.facade.ts    # 🎭 Facade Pattern
│   │   │   │   │   │   └── transactions.routes.ts    # Rotas lazy-loaded
│   │   │   │   │   │
│   │   │   │   │   ├── dashboard/         # Feature de Dashboard
│   │   │   │   │   │   ├── components/    
│   │   │   │   │   │   │   └── account-balance/
│   │   │   │   │   │   ├── pages/
│   │   │   │   │   │   │   └── dashboard/
│   │   │   │   │   │   ├── state/
│   │   │   │   │   │   │   └── balance/
│   │   │   │   │   │   ├── dashboard.facade.ts       # 🎭 Facade Pattern
│   │   │   │   │   │   └── dashboard.routes.ts
│   │   │   │   │   │
│   │   │   │   │   └── auth/              # Feature de Autenticação
│   │   │   │   │       └── auth.routes.ts
│   │   │   │   │
│   │   │   │   ├── core/                  # Serviços core (singleton)
│   │   │   │   │   ├── guards/
│   │   │   │   │   ├── interceptors/
│   │   │   │   │   └── services/
│   │   │   │   │
│   │   │   │   ├── shared/                # Componentes e serviços compartilhados
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── directives/
│   │   │   │   │   └── services/
│   │   │   │   │
│   │   │   │   ├── pages/                 # Páginas base (home, login, etc)
│   │   │   │   ├── app.routes.ts          # Configuração de rotas
│   │   │   │   └── app.config.ts          # Configuração da aplicação
│   │   │   │
│   │   │   ├── environments/              # Configurações de ambiente
│   │   │   └── ...
│   │   ├── module-federation.config.ts
│   │   └── project.json
│   │
│   └── resume-account-mf/                  # Microfrontend de análise de conta
│       ├── src/
│       ├── module-federation.config.ts
│       └── project.json
│
├── application/                            # 🏛️ Camada de Aplicação (Use Cases)
│   └── src/lib/
│       ├── ports/                          # Interfaces de repositórios
│       └── use-cases/                      # Casos de uso da aplicação
│
├── domain/                                 # 🏛️ Camada de Domínio (Entidades)
│   └── src/lib/entities/
│
├── infrastructure/                         # 🏛️ Camada de Infraestrutura
│   └── src/lib/services/                  # Implementações concretas
│
├── docker-compose.yml                      # Orquestração Docker
├── Dockerfile                              # Build da aplicação
├── nginx.conf                              # Configuração Nginx
├── package.json                            # Dependências
├── nx.json                                 # Configuração Nx
└── FACADE_PATTERN.md                       # 📚 Documentação do Facade Pattern
```

### 🎯 Padrões Arquiteturais Implementados

#### 1. **Clean Architecture**
- **Domain**: Entidades de negócio puras
- **Application**: Casos de uso e portas (interfaces)
- **Infrastructure**: Implementações concretas (services, repositories)

#### 2. **Feature Modules**
- Cada feature é auto-contida com seus próprios:
  - Componentes
  - Páginas
  - State management (NgRx)
  - Rotas (lazy loading)
  - Facade

#### 3. **Facade Pattern** 🎭
- Simplifica a comunicação entre componentes e lógica de negócio
- Encapsula NgRx Store, Actions, Selectors e Use Cases
- Reduz complexidade nos componentes
- Facilita testes com mock único

**Exemplo de uso:**
```typescript
// Antes (sem Facade)
export class Component {
  private store = inject(Store);
  private useCase1 = inject(UseCase1);
  private useCase2 = inject(UseCase2);
  // ... múltiplas injeções
}

// Depois (com Facade)
export class Component {
  facade = inject(TransactionsFacade);  // Uma única injeção!
}
```

#### 4. **Lazy Loading**
- Features carregadas sob demanda
- Melhora performance inicial
- Reduz bundle size

### 🔐 Segurança - Criptografia de Senhas

O projeto implementa criptografia de senhas no lado do cliente antes do envio para o backend:

#### **CryptoService**
Serviço responsável pela criptografia usando **SHA-256** e **PBKDF2**:

```typescript
// apps/host-app/src/app/core/services/crypto.service.ts
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

#### **Integração com Autenticação**
O `AuthService` utiliza o `CryptoService` para hash das senhas antes de enviar:

```typescript
login(email: string, password: string): Observable<AuthResponse> {
  const hashedPassword = this.cryptoService.hashPassword(password);
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
    email,
    password: hashedPassword  // ✅ Senha criptografada
  });
}

signUp(user: User): Observable<AuthResponse> {
  const userWithHashedPassword = {
    ...user,
    password: this.cryptoService.hashPassword(user.password)
  };
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`, userWithHashedPassword);
}
```

#### **Benefícios de Segurança**
- ✅ Senha **nunca** trafega em texto plano pela rede
- ✅ Proteção contra **inspeção de rede** (DevTools, Proxies)
- ✅ Hash **irreversível** (SHA-256)
- ✅ Algoritmo **PBKDF2** disponível para maior segurança com salt

#### **Password Policies (Políticas de Senha Forte)**
O sistema implementa validações rigorosas para senhas:

**Requisitos obrigatórios:**
- ✅ Mínimo 8 caracteres
- ✅ Pelo menos uma letra maiúscula (A-Z)
- ✅ Pelo menos uma letra minúscula (a-z)
- ✅ Pelo menos um número (0-9)
- ✅ Pelo menos um caractere especial (!@#$%^&*)
- ✅ Sem espaços em branco
- ✅ Bloqueio de senhas comuns (password123, 12345678, etc)
- ✅ Bloqueio de sequências óbvias (abc, 123, qwe, etc)

**Recursos:**
- 📊 **Indicador de força** em tempo real (Fraca/Média/Forte)
- 🔄 **Confirmação de senha** para evitar erros de digitação
- 💬 **Mensagens de erro específicas** para cada requisito
- ♿ **Acessibilidade completa** com ARIA attributes

**Validador customizado:**
```typescript
// apps/host-app/src/app/core/validators/password.validator.ts
export class PasswordValidator {
  static strong(): ValidatorFn { ... }
  static match(passwordFieldName: string): ValidatorFn { ... }
  static calculateStrength(password: string): number { ... }
}
```

#### **Dependências**
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

> 📚 **Documentação Completa**: 
> - [SECURITY_PASSWORD_HASH.md](./SECURITY_PASSWORD_HASH.md) - Detalhes de criptografia
> - [PASSWORD_POLICIES.md](./PASSWORD_POLICIES.md) - Políticas de senha forte

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run serve:all           # Executa todos os microfrontends
npm run serve:host          # Executa apenas o host app
npm run serve:mf            # Executa apenas o microfrontend

# Build
npm run build:all           # Build de todas as aplicações
npm run build:host          # Build do host app
npm run build:mf            # Build do microfrontend

```

## 🐳 Docker

O projeto inclui configuração completa para Docker com:

- **Multi-stage build** para otimização de imagem
- **Nginx** configurado com CORS para Module Federation
- **Docker Compose** para orquestração completa
- **Volumes** para persistência de dados

### Configuração Docker

#### 1. Estrutura de pastas recomendada:
```
projetos/
├── bytebank-challenge/          # Este repositório (frontend)
└── bytebank-backend/            # Repositório do backend
```

#### 2. Ajustar docker-compose.yml:
No arquivo `docker-compose.yml`, ajuste o caminho do backend:
```yaml
backend-api:
  build:
    context: ../bytebank-backend  # Ajuste este caminho
```

### Arquivos Docker:
- `Dockerfile` - Build das aplicações Angular
- `docker-compose.yml` - Orquestração de todos os serviços
- `nginx.conf` - Configuração do servidor web

## 🌐 Integração com Backend

O frontend integra com a API ByteBank Backend através de:

- **Serviços Angular** para comunicação HTTP
- **Configuração de CORS** para desenvolvimento
- **Environment variables** para URLs da API
- **Autenticação JWT** para rotas protegidas

## 📝 Notas de Desenvolvimento

- O projeto utiliza **Nx** para gerenciamento de monorepo
- **Module Federation** permite desenvolvimento independente dos microfrontends
- **Environment files** são automaticamente substituídos durante o build
- **Docker** está configurado para produção com otimizações