import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Search } from 'lucide-react';
import { productsApi, BILLING_FREQUENCY_LABELS, formatCurrency, } from '@/api/products.api';
import { NewProductModal } from '../components/NewProductModal';
import { ProductDetailDrawer } from '../components/ProductDetailDrawer';
export function ProductsPage() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [active, setActive] = useState('all');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [openNew, setOpenNew] = useState(false);
    const [drawerId, setDrawerId] = useState(null);
    const params = useMemo(() => ({
        page,
        limit: 25,
        search: search || undefined,
        active: active === 'all' ? undefined : active,
        category: category || undefined,
    }), [page, search, active, category]);
    const { data, isLoading } = useQuery({
        queryKey: ['products', params],
        queryFn: () => productsApi.list(params),
    });
    const toggleMut = useMutation({
        mutationFn: ({ id, value }) => productsApi.setActive(id, value),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    });
    const items = data?.items ?? [];
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-foreground", children: "Produtos" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Cat\u00E1logo de produtos vend\u00E1veis. Vincule aos neg\u00F3cios para calcular valores." })] }), _jsxs("button", { type: "button", onClick: () => setOpenNew(true), className: "inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700", children: [_jsx(Plus, { className: "h-4 w-4" }), "Novo produto"] })] }), _jsxs("div", { className: "flex items-center gap-3 border-b border-border px-6 py-3", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" }), _jsx("input", { value: search, onChange: (e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }, placeholder: "Buscar por nome ou c\u00F3digo...", className: "h-9 w-full rounded-md border border-border bg-card pl-8 pr-3 text-sm" })] }), _jsx("input", { value: category, onChange: (e) => {
                            setCategory(e.target.value);
                            setPage(1);
                        }, placeholder: "Categoria", className: "h-9 w-40 rounded-md border border-border bg-card px-2 text-sm" }), _jsxs("select", { value: active, onChange: (e) => {
                            setActive(e.target.value);
                            setPage(1);
                        }, className: "h-9 rounded-md border border-border bg-card px-2 text-sm", children: [_jsx("option", { value: "all", children: "Todos" }), _jsx("option", { value: "true", children: "Apenas ativos" }), _jsx("option", { value: "false", children: "Apenas inativos" })] }), _jsx("div", { className: "ml-auto text-xs text-muted-foreground", children: data ? `${data.total} produto(s)` : '...' })] }), _jsxs("div", { className: "flex-1 overflow-auto", children: [isLoading && (_jsx("div", { className: "p-8 text-sm text-muted-foreground", children: "Carregando produtos..." })), !isLoading && items.length === 0 && (_jsxs("div", { className: "grid place-items-center p-16 text-center", children: [_jsx(Package, { className: "h-12 w-12 text-muted-foreground/50" }), _jsx("h2", { className: "mt-3 text-base font-semibold text-foreground", children: "Cadastre seu primeiro produto" }), _jsx("p", { className: "mt-1 max-w-sm text-sm text-muted-foreground", children: "Produtos podem ser vinculados a neg\u00F3cios com quantidade, desconto e imposto para calcular o valor total." }), _jsxs("button", { type: "button", onClick: () => setOpenNew(true), className: "mt-4 inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700", children: [_jsx(Plus, { className: "h-4 w-4" }), "Novo produto"] })] })), !isLoading && items.length > 0 && (_jsxs("table", { className: "min-w-full divide-y divide-border text-sm", children: [_jsx("thead", { className: "sticky top-0 z-10 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-left", children: "Ativo" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Nome" }), _jsx("th", { className: "px-3 py-2 text-left", children: "C\u00F3digo" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Categoria" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Unidade" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Pre\u00E7os" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Frequ\u00EAncia" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Imposto" }), _jsx("th", { className: "px-3 py-2 text-left", children: "Criado em" })] }) }), _jsx("tbody", { className: "divide-y divide-border bg-card", children: items.map((p) => (_jsx(ProductRow, { product: p, onOpen: () => setDrawerId(p.id), onToggle: (v) => toggleMut.mutate({ id: p.id, value: v }) }, p.id))) })] }))] }), data && data.pages > 1 && (_jsxs("div", { className: "flex items-center justify-between border-t border-border px-6 py-2", children: [_jsxs("span", { className: "text-xs text-muted-foreground", children: ["P\u00E1gina ", data.page, " de ", data.pages] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { type: "button", disabled: page <= 1, onClick: () => setPage((p) => Math.max(1, p - 1)), className: "h-8 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground/80 hover:bg-muted/40 disabled:opacity-40", children: "Anterior" }), _jsx("button", { type: "button", disabled: page >= data.pages, onClick: () => setPage((p) => p + 1), className: "h-8 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground/80 hover:bg-muted/40 disabled:opacity-40", children: "Pr\u00F3xima" })] })] })), _jsx(NewProductModal, { open: openNew, onClose: () => setOpenNew(false) }), _jsx(ProductDetailDrawer, { productId: drawerId, open: drawerId !== null, onClose: () => setDrawerId(null) })] }));
}
function ProductRow({ product, onOpen, onToggle, }) {
    const firstPrice = product.prices?.[0];
    const otherCount = (product.prices?.length ?? 1) - 1;
    return (_jsxs("tr", { className: "cursor-pointer transition-colors hover:bg-muted/40", onClick: onOpen, children: [_jsx("td", { className: "px-3 py-2.5", onClick: (e) => e.stopPropagation(), children: _jsx("label", { className: "inline-flex cursor-pointer items-center", children: _jsx("input", { type: "checkbox", checked: product.active, onChange: (e) => onToggle(e.target.checked), className: "h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500" }) }) }), _jsx("td", { className: "px-3 py-2.5 font-medium text-foreground", children: product.name }), _jsx("td", { className: "px-3 py-2.5 text-foreground/80", children: product.code ?? '—' }), _jsx("td", { className: "px-3 py-2.5 text-foreground/80", children: product.category ?? '—' }), _jsx("td", { className: "px-3 py-2.5 text-foreground/80", children: product.unit ?? '—' }), _jsx("td", { className: "px-3 py-2.5 text-foreground/80", children: firstPrice ? (_jsxs("span", { children: [formatCurrency(firstPrice.price, firstPrice.currency), otherCount > 0 && (_jsxs("span", { className: "ml-1 text-xs text-muted-foreground", children: ["+ ", otherCount, " moeda", otherCount > 1 ? 's' : ''] }))] })) : (_jsx("span", { className: "text-muted-foreground/70", children: "\u2014" })) }), _jsxs("td", { className: "px-3 py-2.5 text-foreground/80", children: [BILLING_FREQUENCY_LABELS[product.billingFrequency], product.billingCycles ? ` · ${product.billingCycles}x` : ''] }), _jsxs("td", { className: "px-3 py-2.5 text-foreground/80", children: [Number(product.tax).toFixed(2), "%"] }), _jsx("td", { className: "px-3 py-2.5 text-muted-foreground", children: new Date(product.createdAt).toLocaleDateString('pt-BR') })] }));
}
