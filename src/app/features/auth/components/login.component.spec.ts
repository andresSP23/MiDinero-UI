import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authServiceMock: any;
    let router: Router;

    beforeEach(async () => {
        // Mock implementations using vi.fn()
        authServiceMock = {
            login: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                provideRouter([])
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have invalid form when empty', () => {
        expect(component.loginForm.valid).toBeFalsy();
    });

    it('should enable submit button when form is valid', () => {
        component.loginForm.controls['email'].setValue('test@test.com');
        component.loginForm.controls['password'].setValue('password123');
        fixture.detectChanges();
        expect(component.loginForm.valid).toBeTruthy();
    });

    it('should call AuthService.login on submit', () => {
        const email = 'test@test.com';
        const password = 'password123';
        authServiceMock.login.mockReturnValue(of({ token: 'fake-token' }));

        component.loginForm.controls['email'].setValue(email);
        component.loginForm.controls['password'].setValue(password);

        component.onSubmit();

        expect(authServiceMock.login).toHaveBeenCalledWith({ email, password });
        expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should set error signal on login failure', () => {
        const errorMsg = 'Invalid credentials';
        authServiceMock.login.mockReturnValue(throwError(() => ({
            error: { businessErrorDescription: errorMsg }
        })));

        component.loginForm.controls['email'].setValue('test@test.com');
        component.loginForm.controls['password'].setValue('wrongpass');

        component.onSubmit();

        expect(component.loading()).toBe(false);
        expect(component.errorSignal()).toBe(errorMsg);
    });
});
