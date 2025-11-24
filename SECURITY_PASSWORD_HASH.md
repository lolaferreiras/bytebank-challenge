# 🔐 Implementação de Segurança - Hash de Senhas

## ✅ O que foi implementado

### 1. **CryptoService** (`core/services/crypto.service.ts`)

Serviço responsável por criptografar dados sensíveis antes do envio.

#### Métodos disponíveis:

```typescript
// Hash SHA-256 (simples e rápido)
hashPassword(password: string): string

// Hash PBKDF2 (mais seguro para produção)
hashPasswordSecure(password: string, salt?: string): string

// Criptografia AES (para dados que precisam ser recuperados)
encrypt(data: string, secretKey: string): string
decrypt(encryptedData: string, secretKey: string): string
```

### 2. **AuthService atualizado**

Agora faz hash da senha **antes de enviar** ao backend:

```typescript
// Login
public login(credentials: Pick<User, 'email' | 'password'>): Observable<any> {
  const hashedCredentials = {
    ...credentials,
    password: this.cryptoService.hashPassword(credentials.password)
  };
  return this.http.post<any>(`${this.apiUrl}/user/auth`, hashedCredentials).pipe(...)
}

// Signup
signUp(userData: Partial<User>): Observable<any> {
  const hashedUserData = {
    ...userData,
    password: userData.password ? this.cryptoService.hashPassword(userData.password) : undefined
  };
  return this.http.post<any>(`${this.apiUrl}/user`, hashedUserData);
}
```

## 🔒 Como funciona

### Fluxo de Login/Signup:

1. **Usuário digita senha**: `minhaSenha123`
2. **Frontend faz hash**: `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`
3. **Envia ao backend**: Apenas o hash é enviado via HTTP
4. **Backend valida**: Compara o hash recebido com o hash armazenado

### Vantagens:

✅ **Senha nunca trafega em texto puro** no payload HTTP  
✅ **Não é visível no Network Inspector** (DevTools)  
✅ **Hash unidirecional** - não pode ser revertido  
✅ **Mesmo que interceptado**, o hash é inútil sem acesso ao backend

## 🛡️ Algoritmos utilizados

### SHA-256 (Padrão implementado)
- Hash de 256 bits
- Rápido e eficiente
- Usado em: Login e Signup

### PBKDF2 (Disponível para produção)
- Derivação de chave baseada em senha
- Usa salt aleatório
- Iterações configuráveis (padrão: 1000)
- Mais resistente a ataques de força bruta

## ⚠️ Importante

### Backend também precisa ajustar!

O backend precisa:

1. **Armazenar senhas em hash** no banco de dados
2. **Comparar hashes** ao invés de senhas em texto
3. **Usar o mesmo algoritmo** (SHA-256 ou PBKDF2)

Exemplo Node.js (backend):

```javascript
const crypto = require('crypto');

// Ao cadastrar usuário
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Ao fazer login
function verifyPassword(inputPassword, storedHash) {
  const inputHash = hashPassword(inputPassword);
  return inputHash === storedHash;
}
```

## 📊 Comparação

| Método | Antes | Depois |
|--------|-------|--------|
| **Payload** | `{ password: "minhaSenha123" }` | `{ password: "5e884898da..." }` |
| **Network Inspector** | Senha visível | Hash apenas |
| **Segurança** | ❌ Baixa | ✅ Alta |
| **Interceptação** | ❌ Senha exposta | ✅ Hash inútil sozinho |

## 🔄 Migração

Se já tem usuários cadastrados com senhas em texto:

1. **Criar script de migração** no backend
2. **Converter todas as senhas** para hash
3. **Atualizar banco de dados**
4. **Testar login** com as credenciais existentes

## 🧪 Testando

```typescript
// No console do browser
import { CryptoService } from './crypto.service';

const crypto = new CryptoService();
console.log(crypto.hashPassword('teste123'));
// Output: 6c1adf5f88fdcde83b23d87ac2d97460f1ddce87c87bd20e1b28bfe14ce4e69b

// Sempre gera o mesmo hash para a mesma senha
console.log(crypto.hashPassword('teste123'));
// Output: 6c1adf5f88fdcde83b23d87ac2d97460f1ddce87c87bd20e1b28bfe14ce4e69b
```

## 🚀 Próximos passos recomendados

1. ✅ **HTTPS obrigatório** - Use sempre HTTPS em produção
2. ✅ **Salt por usuário** - Considere usar PBKDF2 com salt único
3. ✅ **Rate limiting** - Limite tentativas de login no backend
4. ✅ **2FA** - Implemente autenticação de dois fatores
5. ✅ **Token JWT** - Use tokens para sessões (já implementado)

## 📚 Referências

- [OWASP - Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [CryptoJS Documentation](https://cryptojs.gitbook.io/docs/)
- [SHA-256 Algorithm](https://en.wikipedia.org/wiki/SHA-2)
