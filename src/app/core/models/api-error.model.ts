export interface ApiErrorResponse {
    businessErrorCode?: number;
    businessErrorDescription?: string;
    error?: string;
    validationErrors?: string[];
    errors?: { [key: string]: string };
}
