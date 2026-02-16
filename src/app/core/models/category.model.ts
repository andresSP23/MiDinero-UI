export interface Category {
    id: number;
    name: string;
    description: string;
    type: 'INCOME' | 'EXPENSE';
    categoryType: 'INCOME' | 'EXPENSE';
    // color: string; // Not in spec, we will see if backend supports it. Better to keep it for frontend UI unless it causes errors.
}

export interface CategoryRequest {
    name: string;
    description: string;
    categoryType: 'INCOME' | 'EXPENSE';
}
