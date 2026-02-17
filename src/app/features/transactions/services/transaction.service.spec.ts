import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';

// Mock Angular decorators and HttpClient
vi.mock('@angular/core', () => ({
    Injectable: () => (target: any) => target,
    Injector: class { },
    signal: (init: any) => ({
        set: vi.fn(),
        asReadonly: vi.fn(() => () => init),
        update: vi.fn(),
        call: () => init
    }),
    computed: (fn: any) => ({ call: fn })
}));

vi.mock('@angular/common/http', () => ({
    HttpClient: class { },
    HttpParams: class {
        private map = new Map();
        set(key: string, value: any) { this.map.set(key, value); return this; }
        get(key: string) { return this.map.get(key); }
    }
}));

import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
    let service: TransactionService;
    let httpClientSpy: { get: any; post: any; put: any; delete: any };

    beforeEach(() => {
        httpClientSpy = {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn()
        };
        service = new TransactionService(httpClientSpy as any);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getAll should call http.get with correct params', () => {
        const mockResponse = { content: [], totalElements: 0 };
        httpClientSpy.get.mockReturnValue(of(mockResponse));

        service.getAll(0, 10, 'date,desc', 'INCOME').subscribe();

        expect(httpClientSpy.get).toHaveBeenCalledWith(
            expect.stringContaining('/transactions/findAll'),
            expect.objectContaining({
                params: expect.anything()
            })
        );

        // Check params manually since HttpParams are immutable and complex to match exactly with objectContaining
        const callArgs = httpClientSpy.get.mock.calls[0];
        const params = callArgs[1].params;
        expect(params.get('page')).toBe(0);
        expect(params.get('size')).toBe(10);
        expect(params.get('sort')).toBe('date,desc');
        expect(params.get('type')).toBe('INCOME');
    });

    it('create should call http.post', () => {
        const mockTx: any = { id: 1 };
        httpClientSpy.post.mockReturnValue(of(mockTx));
        const request: any = { description: 'Test' };

        service.create(request).subscribe();

        expect(httpClientSpy.post).toHaveBeenCalledWith(
            expect.stringContaining('/transactions/create'),
            request
        );
    });

    it('update should call http.put', () => {
        const mockTx: any = { id: 1 };
        httpClientSpy.put.mockReturnValue(of(mockTx));
        const request: any = { description: 'Updated' };

        service.update(1, request).subscribe();

        expect(httpClientSpy.put).toHaveBeenCalledWith(
            expect.stringContaining('/transactions/update/1'),
            request
        );
    });

    it('delete should call http.delete', () => {
        httpClientSpy.delete.mockReturnValue(of(void 0));

        service.delete(1).subscribe();

        expect(httpClientSpy.delete).toHaveBeenCalledWith(
            expect.stringContaining('/transactions/delete/1')
        );
    });

    it('exportToExcel should call http.get with blob response type', () => {
        httpClientSpy.get.mockReturnValue(of(new Blob()));

        service.exportToExcel('INCOME').subscribe();

        expect(httpClientSpy.get).toHaveBeenCalledWith(
            expect.stringContaining('/dashboard/export/incomes'),
            expect.objectContaining({ responseType: 'blob' })
        );
    });
});
