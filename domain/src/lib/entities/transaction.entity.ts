export type Transaction = {
  id?: number;
  userId?: number;
  accountId: string;
  date: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  account?: string;
  notes?: string;
  tags?: string[];
  anexo?: Attachment;
}

// Crie este novo tipo para representar a estrutura do anexo
export type Attachment = {
  filename: string;
  originalName?: string; // Opcional, mas recomendado
  mimetype?: string;
  size?: number;
  uploadDate?: Date;
  url?: string; // URL para download
};

export type BalanceResult = {
  userId: string;
  balance: number;
  lastCalculatedAt: string;
}

export type BalanceResponse = {
  message: string;
  result: BalanceResult;
}