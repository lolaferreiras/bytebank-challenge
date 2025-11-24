# 🔐 Password Policies - Políticas de Senha Forte

Este documento descreve a implementação de políticas de senha forte no ByteBank Challenge.

## 📋 Requisitos de Senha

### Para Cadastro (SignUp)
Todas as senhas devem atender aos seguintes critérios:

- ✅ **Mínimo 8 caracteres**
- ✅ **Pelo menos uma letra maiúscula** (A-Z)
- ✅ **Pelo menos uma letra minúscula** (a-z)
- ✅ **Pelo menos um número** (0-9)
- ✅ **Pelo menos um caractere especial** (!@#$%^&*(),.?":{}|<>-_=+[]\/;'`~)
- ✅ **Sem espaços em branco**
- ✅ **Não pode ser uma senha comum** (password, 12345678, etc)
- ✅ **Não pode conter sequências óbvias** (abc, 123, qwe, etc)

### Para Login
- Apenas validação de campo obrigatório
- Não aplica regras de complexidade (para não quebrar logins existentes)

## 🛠️ Implementação

### PasswordValidator

Classe utilitária que fornece validadores customizados para senhas:

```typescript
// apps/host-app/src/app/core/validators/password.validator.ts

export class PasswordValidator {
  // Validador principal de senha forte
  static strong(): ValidatorFn { ... }
  
  // Validador para confirmação de senha
  static match(passwordFieldName: string): ValidatorFn { ... }
  
  // Calcular força da senha (0-100)
  static calculateStrength(password: string): number { ... }
  
  // Obter label da força (Fraca/Média/Forte)
  static getStrengthLabel(strength: number): { label: string; color: string } { ... }
}
```

### Uso no Formulário

```typescript
// apps/host-app/src/app/pages/login/login.ts

form = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', this.signupMode() 
    ? [Validators.required, PasswordValidator.strong()]  // ✅ No signup
    : [Validators.required]                               // Login normal
  ),
  confirmPassword: new FormControl('', this.signupMode()
    ? [Validators.required, PasswordValidator.match('password')]
    : []
  )
});
```

## 📊 Indicador de Força da Senha

O sistema calcula automaticamente a força da senha em tempo real:

### Pontuação
- **Comprimento**: 
  - 8+ caracteres: 20 pontos
  - 12+ caracteres: +10 pontos
  - 16+ caracteres: +10 pontos
- **Complexidade**:
  - Letra minúscula: 15 pontos
  - Letra maiúscula: 15 pontos
  - Número: 15 pontos
  - Caractere especial: 15 pontos

### Classificação
- **0-39 pontos**: 🔴 Fraca (vermelho)
- **40-69 pontos**: 🟡 Média (laranja)
- **70-100 pontos**: 🟢 Forte (verde)

## 🎨 Interface do Usuário

### Campo de Senha (SignUp)
```html
<mat-form-field>
  <mat-label>Senha</mat-label>
  <input matInput type="password" formControlName="password" />
  
  <!-- Indicador de força -->
  <mat-hint>
    Força: <strong [style.color]="strengthColor">{{strengthLabel}}</strong>
  </mat-hint>
  
  <!-- Mensagens de erro específicas -->
  <mat-error *ngIf="password.errors?.minLength">
    Mínimo 8 caracteres
  </mat-error>
  <mat-error *ngIf="password.errors?.uppercase">
    Deve conter ao menos uma letra maiúscula
  </mat-error>
  <!-- ... outros erros -->
</mat-form-field>
```

### Campo de Confirmação
```html
<mat-form-field>
  <mat-label>Confirmar Senha</mat-label>
  <input matInput type="password" formControlName="confirmPassword" />
  
  <mat-error *ngIf="confirmPassword.errors?.passwordMismatch">
    As senhas não coincidem
  </mat-error>
</mat-form-field>
```

### Lista de Requisitos
```html
<div class="password-requirements">
  <small><strong>Requisitos da senha:</strong></small>
  <ul>
    <li>Mínimo 8 caracteres</li>
    <li>Uma letra maiúscula (A-Z)</li>
    <li>Uma letra minúscula (a-z)</li>
    <li>Um número (0-9)</li>
    <li>Um caractere especial (!@#$%^&*)</li>
  </ul>
</div>
```

## 🔒 Senhas Proibidas

Lista de senhas comuns que são bloqueadas:

```typescript
const commonPasswords = [
  'password', 'password123', '12345678', '123456789', 'qwerty123',
  'abc12345', 'senha123', 'senha1234', 'admin123', 'user1234',
  '00000000', '11111111', '12341234', 'pass1234', 'test1234'
];
```

## 🧪 Sequências Bloqueadas

Padrões de sequência óbvios que são rejeitados:
- abc, xyz
- 123, 456, 789
- qwe, asd, zxc

## ✅ Exemplos de Senhas

### ❌ Senhas Inválidas
- `senha` - Muito curta, sem maiúscula, número e especial
- `Senha123` - Sem caractere especial
- `Password!` - Sem número
- `password123` - Senha comum (mesmo com requisitos)
- `Abc12345!` - Contém sequência óbvia (abc, 123)

### ✅ Senhas Válidas
- `MyP@ssw0rd!` - ✅ Forte
- `S3nh@F0rt3#` - ✅ Forte
- `C0mpl3x!ty` - ✅ Forte
- `B@nk1ng$2024` - ✅ Forte

## 🔐 Segurança Adicional

### Hash de Senha
Todas as senhas são hasheadas com SHA-256 antes de serem enviadas ao backend:

```typescript
// CryptoService
hashPassword(password: string): string {
  return SHA256(password).toString();
}
```

Ver: [SECURITY_PASSWORD_HASH.md](./SECURITY_PASSWORD_HASH.md)

### Armazenamento
- Tokens armazenados em **sessionStorage** (não persiste após fechar navegador)
- Senhas **NUNCA** são armazenadas localmente
- Hashes enviados via HTTPS

## 📱 Acessibilidade

Todos os campos de senha incluem:
- `aria-describedby` apontando para mensagens de erro
- `aria-invalid` indicando estado de validação
- Labels descritivos
- Mensagens de erro claras e específicas

## 🎯 Benefícios

1. **Segurança**: Previne senhas fracas e comuns
2. **UX**: Feedback em tempo real sobre força da senha
3. **Educação**: Usuários aprendem a criar senhas fortes
4. **Validação**: Erros específicos ajudam a corrigir problemas
5. **Conformidade**: Atende padrões de segurança (OWASP, NIST)

## 📚 Referências

- [OWASP Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [Angular Form Validation](https://angular.io/guide/form-validation)

## 🚀 Próximos Passos

- [ ] Adicionar verificação de senhas vazadas (Have I Been Pwned API)
- [ ] Implementar histórico de senhas (não permitir reutilização)
- [ ] Adicionar expiração de senha (renovação periódica)
- [ ] Verificação de força com zxcvbn library
- [ ] Suporte a passkeys/WebAuthn
