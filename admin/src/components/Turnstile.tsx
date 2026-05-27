import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

/**
 * Widget do Cloudflare Turnstile. Lê a site key de VITE_TURNSTILE_SITE_KEY.
 * Se a chave não estiver definida, não renderiza nada (captcha desativado).
 */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!siteKey || !ref.current) return;

    const render = () => {
      if (window.turnstile && ref.current && !rendered.current) {
        rendered.current = true;
        window.turnstile.render(ref.current, {
          sitekey: siteKey,
          theme: 'auto',
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
  return <div ref={ref} className="my-1 flex justify-center" />;
}
