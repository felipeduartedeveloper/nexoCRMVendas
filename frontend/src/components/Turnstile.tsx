import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

export interface TurnstileHandle {
  /** Descarta o token atual e gera um novo (token Turnstile é de uso único). */
  reset: () => void;
}

/**
 * Widget do Cloudflare Turnstile. Lê a site key de VITE_TURNSTILE_SITE_KEY.
 * Sem a chave, não renderiza nada (captcha desativado).
 * Exponha reset() via ref para obter um token fresco a cada tentativa de login.
 */
export const Turnstile = forwardRef<TurnstileHandle, { onToken: (token: string) => void }>(
  ({ onToken }, ref) => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
    const elRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetId.current !== null) {
          onToken('');
          window.turnstile.reset(widgetId.current);
        }
      },
    }));

    useEffect(() => {
      if (!siteKey || !elRef.current) return;

      const render = () => {
        if (window.turnstile && elRef.current && widgetId.current === null) {
          widgetId.current = window.turnstile.render(elRef.current, {
            sitekey: siteKey,
            theme: 'auto',
            'refresh-expired': 'auto',
            callback: (token: string) => onToken(token),
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
      } else {
        render();
      }
    }, [siteKey, onToken]);

    if (!siteKey) return null;
    return <div ref={elRef} className="flex justify-center" />;
  },
);

Turnstile.displayName = 'Turnstile';
