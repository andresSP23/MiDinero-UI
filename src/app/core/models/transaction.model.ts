import { TransactionType } from '../enums/transaction-type.enum';

export interface Transaction {
    id: number;
    description: string;
    amount: number;
    total: number;
    date: Date;
    createdAt: Date;
    transactionType: TransactionType;
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    paymentMethod: string;
    reference: string;
    notes: string;
    status: string;
    tags: string[];
}

export interface TransactionRequest {
    description: string;
    total: number;
    transactionType: TransactionType;
    categoryId: number;
    paymentMethod: string;
    // Optional fields
    reference?: string;
    notes?: string;
    date?: string; // ISO 8601 string
    tags?: string[];
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
