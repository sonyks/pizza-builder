import { Actions, ofType, Effect } from '@ngrx/effects';
import * as fromAuth from './auth.actions';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponseData, AuthService } from '../auth/auth.service';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../auth/user.model';

const handleAuthentication = (resData: AuthResponseData) => {
    const duration = +resData.expiresIn * 1000;
    const expirationDate = new Date(new Date().getTime() + duration);
    const user = new User(resData.email, resData.localId, resData.idToken, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));

    return new fromAuth.AuthenticateSuccess({
        email: resData.email,
        id: resData.localId,
        token: resData.idToken,
        tokenExpirationDate: expirationDate,
        redirect: true
    });
};

const handleError = (errorRes: HttpErrorResponse) => {
    let errorMessage = 'An error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
        return of(new fromAuth.AuthenticateFail(errorMessage));
    }

    switch (errorRes.error.error.message) {
        case 'EMAIL_EXISTS': {
            errorMessage = 'The email address is already in use by another account.';
            break;
        }
        case 'OPERATION_NOT_ALLOWED': {
            errorMessage = 'Password sign-in is disabled for this project.';
            break;
        }
        case 'TOO_MANY_ATTEMPTS_TRY_LATER': {
            errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.';
            break;
        }
        case 'EMAIL_NOT_FOUND': {
            errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.';
            break;
        }
        case 'INVALID_PASSWORD': {
            errorMessage = 'The password is invalid or the user does not have a password.';
            break;
        }
        case 'USER_DISABLED': {
            errorMessage = 'The user account has been disabled by an administrator.';
            break;
        }
    }

    return of(new fromAuth.AuthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {
    @Effect()
    authSignup = this.actions$.pipe(
        ofType(fromAuth.SIGNUP_START),
        switchMap((authData: fromAuth.SignupStart) => {
            return this.httpClient
                .post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`, {
                email: authData.payload.email,
                password: authData.payload.password,
                returnSecureToken: true
            }).pipe(
                tap((respData) => {
                    this.authService.setLogoutTimer(+respData.expiresIn * 1000);
                }),
                map(resData => {
                    return handleAuthentication(resData);
                }),
                catchError(error => {
                    return handleError(error);
                })
            );
        })
    );

    @Effect()
    authLogin = this.actions$.pipe(
        ofType(fromAuth.LOGIN_START),
        switchMap((authData: fromAuth.LoginStart) => {
            return this.httpClient
                .post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=
                    ${environment.firebaseAPIKey}`, {
                email: authData.payload.email,
                password: authData.payload.password,
                returnSecureToken: true
            }).pipe(
                tap((respData) => {
                    this.authService.setLogoutTimer(+respData.expiresIn * 1000);
                }),
                map(resData => {
                    return handleAuthentication(resData);
                }),
                catchError(error => {
                    return handleError(error);
                })
            );
        })
    );

    @Effect({ dispatch: false })
    authRedirect = this.actions$.pipe(
        ofType(fromAuth.AUTHENTICATE_SUCCESS),
        tap((authSuccessAction: fromAuth.AuthenticateSuccess) => {
            if (authSuccessAction.payload.redirect) {
                this.router.navigate(['/']);
            }
        })
    );

    @Effect()
    authLogout = this.actions$.pipe(
        ofType(fromAuth.LOGOUT),
        tap(() => {
            this.authService.clearLogoutTimer();
            localStorage.removeItem('userData');
            this.router.navigate(['/auth']);
        })
    );

    @Effect()
    autoLogin = this.actions$.pipe(
        ofType(fromAuth.AUTO_LOGIN),
        map(() => {
            const userDate = JSON.parse(localStorage.getItem('userData'));
            if (!userDate) {
                return { type: 'DUMMY'};
            }

            const expirationDate = new Date(userDate._tokenExpirationDate);
            const loadedUser = new User(
                userDate.email,
                userDate.id,
                userDate._token,
                expirationDate
            );

            if (loadedUser.token) {
                const expirationDuration = expirationDate.getTime() - new Date().getTime();
                this.authService.setLogoutTimer(expirationDuration);
                return new fromAuth.AuthenticateSuccess({
                    email: loadedUser.email,
                    id: loadedUser.id,
                    token: loadedUser.token,
                    tokenExpirationDate: expirationDate,
                    redirect: false
                });
            }

            return { type: 'DUMMY'};
        })
    );

    constructor(private actions$: Actions,
                private httpClient: HttpClient,
                private router: Router,
                private authService: AuthService) {}

}
