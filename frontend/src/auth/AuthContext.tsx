import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  googleSignIn as apiGoogleSignIn,
  loginWithEmail as apiLoginWithEmail,
  refreshSession,
  type GoogleSignInPayload,
  type LoginPayload,
} from "../api";
import type { AuthUser, JwtAuthResponse } from "../types";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  remember: boolean;
};

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  signInWithPassword: (payload: LoginPayload) => Promise<JwtAuthResponse>;
  signInWithGoogle: (payload: GoogleSignInPayload) => Promise<JwtAuthResponse>;
  refreshAccessToken: () => Promise<string | null>;
  signOut: () => void;
  applyAuthResponse: (payload: JwtAuthResponse) => JwtAuthResponse;
};

const LOCAL_STORAGE_KEY = "healteex-auth";
const SESSION_STORAGE_KEY = "healteex-auth-session";

const defaultState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  remember: true,
};

function readStoredState(): AuthState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const read = (key: string) => {
    try {
      const raw = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as AuthState;
    } catch {
      return null;
    }
  };

  return read(LOCAL_STORAGE_KEY) ?? read(SESSION_STORAGE_KEY) ?? defaultState;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readStoredState());

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
    } else {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, storagePayload);
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [state]);

  const setSession = useCallback((payload: JwtAuthResponse) => {
    setState({
      accessToken: payload.access,
      refreshToken: payload.refresh,
      user: payload.user,
      remember: payload.remember_me,
    });
    return payload;
  }, []);

  const signInWithPassword = useCallback(
    async (payload: LoginPayload) => {
      const response = await apiLoginWithEmail(payload);
      return setSession(response);
    },
    [setSession]
  );

  const signInWithGoogle = useCallback(
    async (payload: GoogleSignInPayload) => {
      const response = await apiGoogleSignIn(payload);
      return setSession(response);
    },
    [setSession]
  );

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
    } catch (error) {
      console.error("Failed to refresh token", error);
      setState(defaultState);
      return null;
    }
  }, [state.refreshToken]);

  const signOut = useCallback(() => {
    setState(defaultState);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
      isAuthenticated: Boolean(state.accessToken && state.user),
      signInWithPassword,
      signInWithGoogle,
      refreshAccessToken,
      signOut,
      applyAuthResponse: setSession,
    }),
    [state, signInWithPassword, signInWithGoogle, refreshAccessToken, signOut, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
