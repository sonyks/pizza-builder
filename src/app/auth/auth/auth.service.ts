import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer'
import * as authActions from '../store/auth.actions'

export interface AuthResponseData {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean
}

@Injectable({providedIn: "root"})
export class AuthService {
    token: string = null;
    private tokenExpirationTimer: any;

    constructor(private httpClient: HttpClient,
        private router: Router,
        private store: Store<fromApp.AppState>) {}

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout()
        }, expirationDuration);
    }

    autoLogin() {
        const userDate = JSON.parse(localStorage.getItem('userData'));
        if (!userDate) {
            return;
        }

        const expirationDate = new Date(userDate._tokenExpirationDate);
        const loadedUser: User = {
            ...userDate,
            _tokenExpirationDate: expirationDate
        };

        if (loadedUser.token) {
            this.store.dispatch(new authActions.AuthenticateSuccess({
                email: loadedUser.email,
                id: loadedUser.id,
                token: loadedUser.token,
                tokenExpirationDate: expirationDate
            }));
            const expirationDuration = expirationDate.getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    }

    logout() {
        this.store.dispatch(new authActions.Logout());
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
    }

    private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
        const duration = expiresIn * 1000;
        const expirationDate = new Date(new Date().getTime() + duration);
        const user = new User(email, userId, token, expirationDate);
        this.store.dispatch(new authActions.AuthenticateSuccess({
            email: email,
            id: userId,
            token: token,
            tokenExpirationDate: expirationDate
        }));
        this.autoLogout(duration);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An error occurred!';
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage);
        }

        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS': {
                errorMessage = 'The email address is already in use by another account.'
                break; 
            }
            case 'OPERATION_NOT_ALLOWED': {
                errorMessage = 'Password sign-in is disabled for this project.'
                break; 
            }
            case 'TOO_MANY_ATTEMPTS_TRY_LATER': {
                errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.'
                break; 
            }
            case 'EMAIL_NOT_FOUND': {
                errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.'
                break; 
            }
            case 'INVALID_PASSWORD': {
                errorMessage = 'The password is invalid or the user does not have a password.'
                break; 
            }
            case 'USER_DISABLED': {
                errorMessage = 'The user account has been disabled by an administrator.'
                break; 
            }
        }

        return throwError(errorMessage);
    }
}