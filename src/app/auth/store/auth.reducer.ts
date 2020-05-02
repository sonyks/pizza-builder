import { User } from '../auth/user.model';
import * as fromAuth from './auth.actions';

export interface State {
    user: User;
    authError: string;
    loading: boolean;
}

const initialState: State = {
    user: null,
    authError: null,
    loading: false
};

export function authReducer(state = initialState, action: fromAuth.AuthActions) {
    switch (action.type) {
        case fromAuth.AUTHENTICATE_SUCCESS: {
            const user = new User(
                action.payload.email,
                action.payload.id,
                action.payload.token,
                action.payload.tokenExpirationDate
            );
            return {
                ...state,
                user,
                authError: null,
                loading: false
            };
        }
        case fromAuth.LOGOUT:
            return {
                ...state,
                user: null,
                authError: null
            };
        case fromAuth.SIGNUP_START:
        case fromAuth.LOGIN_START:
            return {
                ...state,
                authError: null,
                loading: true
            };
        case fromAuth.AUTHENTICATE_FAIL:
            return {
                ...state,
                user: null,
                authError: action.payload,
                loading: false
            };
        case fromAuth.CLEAR_ERROR:
            return {
                ...state,
                authError: null,
            };
        default:
            return state;
    }
}
