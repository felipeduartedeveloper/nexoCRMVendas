const formatters = new Map<string, Intl.NumberFormat>();

function fmt(currency: string) {
  const key = currency.toUpperCase();
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(currencyToLocale(key), {
      style: 'currency',
      currency: key,
      maximumFractionDigits: 0,
    });
    formatters.set(key, f);
  }
  return f;
}

function currencyToLocale(currency: string): string {
  switch (currency) {
    case 'BRL':
      return 'pt-BR';
    case 'EUR':
      return 'pt-PT';
    case 'GBP':
      return 'en-GB';
    case 'USD':
      return 'en-US';
    case 'ARS':
      return 'es-AR';
    case 'MXN':
      return 'es-MX';
    default:
      return 'en-US';
  }
}

export function formatMoney(value: number | string | null | undefined, currency = 'USD'): string {
  const n = typeof value === 'string' ? Number(value) : value ?? 0;
  if (!Number.isFinite(n)) return fmt(currency).format(0);
  return fmt(currency).format(n);
}

export function initials(name: string, count = 2): string {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, count)
    .join('')
    .toUpperCase();
}
