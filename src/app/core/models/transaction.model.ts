export interface Transaction {
    id: number;
    description: string;
    total: number;
    transactionType: 'INCOME' | 'EXPENSE';
    categoryId: number;
    categoryName: string;
    createdAt: string; // LocalDateTime
}

export interface TransactionRequest {
    description: string;
    total: number;
    transactionType: 'INCOME' | 'EXPENSE';
    categoryId: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
