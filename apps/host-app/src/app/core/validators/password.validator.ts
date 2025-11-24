import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de senha forte
 * 
 * Requisitos de segurança:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula (A-Z)
 * - Pelo menos uma letra minúscula (a-z)
 * - Pelo menos um número (0-9)
 * - Pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)
 * - Não pode conter espaços
 * - Não pode ser uma senha comum (ex: 12345678, password, etc)
 */
export class PasswordValidator {
  
  /**
   * Validador de senha forte
   */
  static strong(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null; // Se vazio, deixa o required lidar
      }

      const errors: ValidationErrors = {};

      // Verificar comprimento mínimo
      if (value.length < 8) {
        errors['minLength'] = { requiredLength: 8, actualLength: value.length };
      }

      // Verificar letra maiúscula
      if (!/[A-Z]/.test(value)) {
        errors['uppercase'] = true;
      }

      // Verificar letra minúscula
      if (!/[a-z]/.test(value)) {
        errors['lowercase'] = true;
      }

      // Verificar número
      if (!/[0-9]/.test(value)) {
        errors['number'] = true;
      }

      // Verificar caractere especial
      if (!/[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/;'`~]/.test(value)) {
        errors['special'] = true;
      }

      // Verificar espaços
      if (/\s/.test(value)) {
        errors['noSpaces'] = true;
      }

      // Verificar senhas comuns
      const commonPasswords = [
        'password', 'password123', '12345678', '123456789', 'qwerty123',
        'abc12345', 'senha123', 'senha1234', 'admin123', 'user1234',
        '00000000', '11111111', '12341234', 'pass1234', 'test1234'
      ];
      
      if (commonPasswords.includes(value.toLowerCase())) {
        errors['common'] = true;
      }

      // Verificar sequências óbvias
      if (/(?:abc|123|xyz|qwe|asd|zxc)/i.test(value)) {
        errors['sequence'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Validador de confirmação de senha
   * Use em conjunto com o campo de confirmar senha
   */
  static match(passwordFieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const password = control.parent.get(passwordFieldName);
      const confirmPassword = control;

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.value === '') {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        return { passwordMismatch: true };
      }

      return null;
    };
  }

  /**
   * Calcula a força da senha (0-100)
   */
  static calculateStrength(password: string): number {
    if (!password) return 0;

    let strength = 0;

    // Comprimento
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    // Complexidade
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/;'`~]/.test(password)) strength += 15;

    return Math.min(strength, 100);
  }

  /**
   * Retorna a descrição da força da senha
   */
  static getStrengthLabel(strength: number): { label: string; color: string } {
    if (strength < 40) return { label: 'Fraca', color: 'warn' };
    if (strength < 70) return { label: 'Média', color: 'accent' };
    return { label: 'Forte', color: 'primary' };
  }
}
