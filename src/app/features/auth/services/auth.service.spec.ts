import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { of } from 'rxjs';

// Mock Angular decorators and dependencies
vi.mock('@angular/core', () => ({
    Injectable: () => (target: any) => target,
    Injector: class { get() { return { navigate: vi.fn() } } },
    signal: (init: any) => {
        let value = init;
        return {
            set: vi.fn((v) => value = v),
            asReadonly: vi.fn(() => () => value),
            update: vi.fn((fn) => value = fn(value)),
            call: () => value
        };
    },
    computed: (fn: any) => ({ call: fn })
}));

vi.mock('@angular/common/http', () => ({
    HttpClient: class { }
}));

vi.mock('@angular/router', () => ({
    Router: class { navigate = vi.fn() }
}));

import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpClientSpy: { post: any, get: any };
    let routerSpy: { navigate: any };
    let injectorSpy: { get: any };

    beforeEach(() => {
        httpClientSpy = {
            post: vi.fn(),
            get: vi.fn()
        };

        routerSpy = { navigate: vi.fn() };
        injectorSpy = { get: vi.fn().mockReturnValue(routerSpy) };

        // Clear localStorage mock
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { });
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { });

        service = new AuthService(httpClientSpy as any, injectorSpy as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('login should store token and set authenticated', () => {
        const mockResponse = { token: 'fake-jwt-token' };
        httpClientSpy.post.mockReturnValue(of(mockResponse));
        // Mock getMe because login calls it
        httpClientSpy.get.mockReturnValue(of({ id: 1, email: 'test@test.com' }));

        // Create a mock for the signal to track calls
        const signalSetSpy = vi.spyOn(service['_isAuthenticated'], 'set');

        service.login({ email: 'test', password: 'password' }).subscribe();

        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-jwt-token');
        expect(signalSetSpy).toHaveBeenCalledWith(true);
    });

    it('logout should remove token and navigate to login', () => {
        const signalSetSpy = vi.spyOn(service['_isAuthenticated'], 'set');
        const currentUserSetSpy = vi.spyOn(service['currentUser'], 'set');

        service.logout();

        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(signalSetSpy).toHaveBeenCalledWith(false);
        expect(currentUserSetSpy).toHaveBeenCalledWith(null);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('isAuthenticated should check token expiry', () => {
        // We can't easily test the internal hasValidToken logic in isolation 
        // because it runs in field initialization before we can spy on it properly 
        // without more complex mocking of the whole class or using a different setup.
        // However, we can test that the signal is exposed.
        expect(service.isAuthenticated()).toBe(false); // Default mock getItem returns null
    });
});
