import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
/**
 * Widget do Cloudflare Turnstile. Lê a site key de VITE_TURNSTILE_SITE_KEY.
 * Sem a chave, não renderiza nada (captcha desativado).
 * Exponha reset() via ref para obter um token fresco a cada tentativa de login.
 */
export const Turnstile = forwardRef(({ onToken }, ref) => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const elRef = useRef(null);
    const widgetId = useRef(null);
    useImperativeHandle(ref, () => ({
        reset: () => {
            if (window.turnstile && widgetId.current !== null) {
                onToken('');
                window.turnstile.reset(widgetId.current);
            }
        },
    }));
    useEffect(() => {
        if (!siteKey || !elRef.current)
            return;
        const render = () => {
            if (window.turnstile && elRef.current && widgetId.current === null) {
                widgetId.current = window.turnstile.render(elRef.current, {
                    sitekey: siteKey,
                    theme: 'auto',
                    'refresh-expired': 'auto',
                    callback: (token) => onToken(token),
                    'error-callback': () => onToken(''),
                    'expired-callback': () => onToken(''),
                });
            }
        };
        if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
            const s = document.createElement('script');
            s.src = SCRIPT_SRC;
            s.async = true;
            s.defer = true;
            s.onload = render;
            document.head.appendChild(s);
        }
        else {
            render();
        }
    }, [siteKey, onToken]);
    if (!siteKey)
        return null;
    return _jsx("div", { ref: elRef, className: "flex justify-center" });
});
Turnstile.displayName = 'Turnstile';
