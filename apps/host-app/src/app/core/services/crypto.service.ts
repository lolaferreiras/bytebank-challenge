import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  /**
   * Gera um hash SHA-256 da senha
   * Este hash é unidirecional e não pode ser descriptografado
   */
  hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  }

  /**
   * Gera um hash mais seguro usando PBKDF2
   * Recomendado para produção
   */
  hashPasswordSecure(password: string, salt?: string): string {
    const useSalt = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    const hash = CryptoJS.PBKDF2(password, useSalt, {
      keySize: 256/32,
      iterations: 1000
    }).toString();
    
    return `${useSalt}:${hash}`;
  }

  /**
   * Opcional: Criptografia simétrica se precisar descriptografar
   * (NÃO recomendado para senhas, apenas para dados sensíveis que precisam ser recuperados)
   */
  encrypt(data: string, secretKey: string): string {
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  }

  decrypt(encryptedData: string, secretKey: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
