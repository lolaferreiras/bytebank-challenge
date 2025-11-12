import { Injectable, inject } from '@angular/core';
import { ITransactionRepository } from '../ports/itransaction.repository';

@Injectable({ providedIn: 'root' })
export class UploadAttachmentUseCase {
  private repository = inject(ITransactionRepository);

  execute(transactionId: number | string, file: File) {
    return this.repository.uploadAttachment(transactionId, file);
  }
}