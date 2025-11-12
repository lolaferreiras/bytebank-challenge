import { Injectable, inject } from '@angular/core';
import { ITransactionRepository } from '../ports/itransaction.repository';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DownloadAttachmentUseCase {
  private repository = inject(ITransactionRepository);

  execute(filename: string): Observable<Blob> {
    return this.repository.downloadAttachment(filename);
  }
}