import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from "react";
import { googleSignIn as apiGoogleSignIn, loginWithEmail as apiLoginWithEmail, refreshSession, } from "../api";
const LOCAL_STORAGE_KEY = "healteex-auth";
const SESSION_STORAGE_KEY = "healteex-auth-session";
const defaultState = {
    accessToken: null,
    refreshToken: null,
    user: null,
    remember: true,
};
function readStoredState() {
    if (typeof window === "undefined") {
        return defaultState;
    }
    const read = (key) => {
        try {
            const raw = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
            if (!raw)
                return null;
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    };
    return read(LOCAL_STORAGE_KEY) ?? read(SESSION_STORAGE_KEY) ?? defaultState;
}
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [state, setState] = useState(() => readStoredState());
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const storagePayload = JSON.stringify(state);
        if (!state.accessToken || !state.refreshToken) {
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
            window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
            return;
        }
        if (state.remember) {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, storagePayload);
            window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
        else {
            window.sessionStorage.setItem(SESSION_STORAGE_KEY, storagePayload);
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, [state]);
    const setSession = useCallback((payload) => {
        setState({
            accessToken: payload.access,
            refreshToken: payload.refresh,
            user: payload.user,
            remember: payload.remember_me,
        });
        return payload;
    }, []);
    const signInWithPassword = useCallback(async (payload) => {
        const response = await apiLoginWithEmail(payload);
        return setSession(response);
    }, [setSession]);
    const signInWithGoogle = useCallback(async (payload) => {
        const response = await apiGoogleSignIn(payload);
        return setSession(response);
    }, [setSession]);
    const refreshAccessToken = useCallback(async () => {
        if (!state.refreshToken) {
            return null;
        }
        try {
            const response = await refreshSession({ refresh: state.refreshToken });
            setState((previous) => ({
                ...previous,
                accessToken: response.access,
            }));
            return response.access;
        }
        catch (error) {
            console.error("Failed to refresh token", error);
            setState(defaultState);
            return null;
        }
    }, [state.refreshToken]);
    const signOut = useCallback(() => {
        setState(defaultState);
    }, []);
    const value = useMemo(() => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: Boolean(state.accessToken && state.user),
        signInWithPassword,
        signInWithGoogle,
        refreshAccessToken,
        signOut,
        applyAuthResponse: setSession,
    }), [state, signInWithPassword, signInWithGoogle, refreshAccessToken, signOut, setSession]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
