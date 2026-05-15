import { api, unwrap } from '@/lib/api';

export type BillingFrequency =
  | 'ONE_TIME'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUAL'
  | 'ANNUAL';

export type ProductVisibility = 'OWNER' | 'OWNER_GROUP' | 'ENTIRE_COMPANY';

export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

export interface ProductPrice {
  id: string;
  productId: string;
  currency: string;
  price: number | string;
  costPrice: number | string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  organizationId: string | null;
  ownerUserId: string | null;
  name: string;
  code: string | null;
  description: string | null;
  unit: string | null;
  category: string | null;
  tax: number | string;
  billingFrequency: BillingFrequency;
  billingCycles: number | null;
  active: boolean;
  visibleTo: ProductVisibility;
  prices: ProductPrice[];
  createdAt: string;
  updatedAt: string;
}

export interface DealProductLine {
  id: string;
  organizationId: string;
  dealId: string;
  productId: string;
  quantity: number;
  itemPrice: number | string;
  currency: string;
  discount: number | string;
  discountType: DiscountType;
  tax: number | string;
  enabledFlag: boolean;
  createdAt: string;
  product: Product | null;
  subtotal: number;
  total: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreatePriceInput {
  currency: string;
  price: number;
  costPrice?: number;
}

export interface CreateProductInput {
  name: string;
  code?: string;
  description?: string;
  unit?: string;
  category?: string;
  tax?: number;
  billingFrequency?: BillingFrequency;
  billingCycles?: number;
  active?: boolean;
  visibleTo?: ProductVisibility;
  prices?: CreatePriceInput[];
}

export const productsApi = {
  list: async (
    params: { page?: number; limit?: number; search?: string; active?: string; category?: string } = {},
  ) => unwrap<Paginated<Product>>(await api.get('/products', { params })),
  one: async (id: string) => unwrap<Product>(await api.get(`/products/${id}`)),
  create: async (data: CreateProductInput) =>
    unwrap<Product>(await api.post('/products', data)),
  update: async (id: string, data: Partial<CreateProductInput>) =>
    unwrap<Product>(await api.patch(`/products/${id}`, data)),
  setActive: async (id: string, active: boolean) =>
    unwrap<Product>(await api.patch(`/products/${id}/active`, { active })),
  remove: async (id: string) => await api.delete(`/products/${id}`),

  addToDeal: async (data: {
    dealId: string;
    productId: string;
    quantity?: number;
    itemPrice: number;
    currency?: string;
    discount?: number;
    discountType?: DiscountType;
    tax?: number;
  }) => unwrap<DealProductLine>(await api.post('/products/deal-products', data)),
  removeFromDeal: async (id: string) =>
    await api.delete(`/products/deal-products/${id}`),
  listOfDeal: async (dealId: string) =>
    unwrap<DealProductLine[]>(await api.get(`/deals/${dealId}/products`)),
};

export const BILLING_FREQUENCY_LABELS: Record<BillingFrequency, string> = {
  ONE_TIME: 'Único',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  SEMI_ANNUAL: 'Semestral',
  ANNUAL: 'Anual',
};

export const VISIBILITY_LABELS: Record<ProductVisibility, string> = {
  OWNER: 'Apenas o responsável',
  OWNER_GROUP: 'Grupo do responsável',
  ENTIRE_COMPANY: 'Toda a empresa',
};

export function formatCurrency(amount: number | string, currency = 'BRL'): string {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}
