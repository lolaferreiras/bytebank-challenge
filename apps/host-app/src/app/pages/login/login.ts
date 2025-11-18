import { AuthService } from '@core/services/auth';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@shared/services/notification';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { User } from '@core/models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogModule,
    MatFormFieldModule, 
    MatIconModule,
    MatInputModule, 
    ReactiveFormsModule,
    NgOptimizedImage
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  auth = inject(AuthService);
  router = inject(Router);
  notificationService = inject(NotificationService); 
  dialogRef = inject(MatDialogRef<Login>);
  signupData = inject<boolean>(MAT_DIALOG_DATA);

  showPassword = signal(false);
  signupMode = computed(() => !!this.signupData);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]),
    username: new FormControl('', this.signupMode() ? [
      Validators.required, 
      Validators.pattern(/^(?!\s)(?!.*^\s+$).+/)
    ] : Validators.pattern(/^(?!\s)(?!.*^\s+$).+/)),
    password: new FormControl('', Validators.required)
  });

  onSubmit() {
    if(this.form.invalid) {
      this.form.markAllAsTouched();
      return
    }
    const formValues = this.form.getRawValue();

    const signupData: Partial<User> = {
            username: formValues.username ?? '',
            email: formValues.email ?? '',
            password: formValues.password ?? ''
    };

    const loginData: Pick<User, "email" | "password"> = {
            email: formValues.email ?? '',
            password: formValues.password ?? ''
    };

    // const userData = this.form.getRawValue() as {email: string, password: string};
    const req = this.signupMode() ? this.auth.signUp(signupData) : this.auth.login(loginData);
    req.subscribe({
      next: () => {
        if(this.signupMode()) {
          this.notificationService.showToast('User created! Please log in.', 'success');
          this.dialogRef.close();
          return
        };
        this.notificationService.showToast('Login successful', 'success');
        this.dialogRef.close();
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.notificationService.showToast('Invalid credentials', 'error');
        if (this.signupMode()) {
          this.form.get('email')?.setErrors({emailExists: true});
        }
      }
    }); 
  }
/*
  getAccount() {
    this.auth.setAccountId().subscribe({
      next: () => {},
      error: () => {}
    }); 
  }
*/

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

}
