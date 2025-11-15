import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
function loadGoogleScript() {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
            resolve();
            return;
        }
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }
        const existing = document.getElementById("google-identity-services");
        if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Failed to load Google identity script")), {
                once: true,
            });
            return;
        }
        const script = document.createElement("script");
        script.id = "google-identity-services";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google identity script"));
        document.head.appendChild(script);
    });
}
export function GoogleSignInButton({ onCredential, disabled = false }) {
    const buttonRef = useRef(null);
    useEffect(() => {
        let cancelled = false;
        if (!CLIENT_ID || disabled) {
            return;
        }
        loadGoogleScript()
            .then(() => {
            if (cancelled || !window.google?.accounts?.id)
                return;
            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: (response) => {
                    if (response.credential) {
                        onCredential(response.credential);
                    }
                },
            });
            if (buttonRef.current) {
                window.google.accounts.id.renderButton(buttonRef.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: "signin_with",
                    shape: "pill",
                });
            }
        })
            .catch((error) => {
            console.error(error);
        });
        return () => {
            cancelled = true;
        };
    }, [onCredential, disabled]);
    if (!CLIENT_ID) {
        return (_jsx("button", { type: "button", disabled: true, className: "google-disabled", children: "Configure `VITE_GOOGLE_CLIENT_ID` to enable Google sign-in" }));
    }
    return _jsx("div", { ref: buttonRef });
}
