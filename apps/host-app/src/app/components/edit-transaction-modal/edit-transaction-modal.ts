import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Transaction } from '@bytebank-challenge/domain';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { MatIconModule } from '@angular/material/icon';

registerLocaleData(localePt);

@Component({
  selector: 'app-edit-transaction-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    NgxMaskDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  providers: [
    provideNgxMask(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
  templateUrl: './edit-transaction-modal.html',
  styleUrl: './edit-transaction-modal.scss',
})
export class EditTransactionModal implements OnInit {
  editedTransaction!: Transaction;
  newFile: File | null = null;
  selectedDate: Date | null = null;

  data = inject(MAT_DIALOG_DATA) as { transaction: Transaction };
  private dialogRef = inject(MatDialogRef<EditTransactionModal>) as MatDialogRef<EditTransactionModal, any>;

  ngOnInit() {
    this.editedTransaction = { ...this.data.transaction };

    // Converter a string da data para objeto Date para o datepicker
    if (this.editedTransaction.date) {
      this.selectedDate = new Date(this.editedTransaction.date);
    } else {
      this.selectedDate = new Date();
      this.editedTransaction.date = this.selectedDate.toISOString();
    }

    // Garantir que a descrição não seja undefined
    if (!this.editedTransaction.description) {
      this.editedTransaction.description = '';
    }

    // Garantir que a categoria não seja undefined
    if (!this.editedTransaction.category) {
      this.editedTransaction.category = 'Não definida';
    }

    // Garantir que o valor seja um número válido
    if (this.editedTransaction.amount === null || this.editedTransaction.amount === undefined) {
      this.editedTransaction.amount = 0;
    }

    // Garantir que o tipo seja válido
    if (!this.editedTransaction.type) {
      this.editedTransaction.type = 'expense';
    }

    // Garantir que o anexo seja inicializado corretamente
    if (!this.editedTransaction.anexo) {
      this.editedTransaction.anexo = undefined;
    }

    // Log para debug
    console.log('Transaction data:', this.editedTransaction);
    console.log('Anexo:', this.editedTransaction.anexo);
    console.log('Attachment name:', this.getAttachmentName());
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newFile = file;
      console.log('Novo arquivo selecionado:', file.name);
    } else {
      this.newFile = null;
      console.log('Nenhum arquivo selecionado');
    }
  }

  onDateChange(date: Date): void {
    if (date) {
      this.editedTransaction.date = date.toISOString();
    }
  }

  getAttachmentName(): string {
    // Se há um novo arquivo selecionado, mostra o nome dele
    if (this.newFile) {
      return this.newFile.name;
    }

    // Se há um anexo existente, mostra o nome dele
    if (this.hasValidAttachment()) {
      return this.editedTransaction.anexo!.originalName || this.editedTransaction.anexo!.filename;
    }

    // Se não há anexo, mostra mensagem amigável
    return 'Nenhum comprovante anexado';
  }

  private hasValidAttachment(): boolean {
    return !!(this.editedTransaction.anexo &&
      (this.editedTransaction.anexo.originalName || this.editedTransaction.anexo.filename));
  }

  submit() {
    this.dialogRef.close({
      transaction: this.editedTransaction,
      file: this.newFile
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
