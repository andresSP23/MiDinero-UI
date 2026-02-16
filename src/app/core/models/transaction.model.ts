export interface Transaction {
    id: number;
    description: string;
    total: number;
    transactionType: 'INCOME' | 'EXPENSE';
    categoryId: number;
    categoryName: string;
    date: string;
    paymentMethod: string;
}

export interface TransactionRequest {
    description: string;
    total: number;
    transactionType: 'INCOME' | 'EXPENSE';
    categoryId: number;
    date: string;
    paymentMethod: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
