import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Merge, AlertTriangle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { contactsApi } from '@/api/contacts.api';
import { extractErrorMessage } from '@/lib/api';
export function MergeDuplicatesTab() {
    const qc = useQueryClient();
    const q = useQuery({ queryKey: ['contacts-duplicates'], queryFn: contactsApi.duplicates });
    const [working, setWorking] = useState(null);
    const merge = useMutation({
        mutationFn: ({ targetId, sourceIds }) => contactsApi.merge(targetId, sourceIds),
        onMutate: ({ targetId }) => setWorking(targetId),
        onSuccess: async () => {
            toast.success('Contatos mesclados!');
            await qc.invalidateQueries({ queryKey: ['contacts-duplicates'] });
            await qc.invalidateQueries({ queryKey: ['contacts'] });
        },
        onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao mesclar.')),
        onSettled: () => setWorking(null),
    });
    if (q.isLoading) {
        return _jsx("div", { className: "p-12 text-center text-sm text-muted-foreground", children: "Procurando duplicatas\u2026" });
    }
    const groups = q.data ?? [];
    if (!groups.length) {
        return (_jsxs("div", { className: "p-12 text-center", children: [_jsx(Merge, { className: "mx-auto h-10 w-10 text-success" }), _jsx("p", { className: "mt-3 text-sm font-semibold text-foreground", children: "Tudo limpo!" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Nenhum contato duplicado por e-mail encontrado." })] }));
    }
    return (_jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), "Encontramos ", groups.length, " ", groups.length === 1 ? 'grupo' : 'grupos', " de contatos com o mesmo e-mail. Selecione qual manter."] }), _jsx("ul", { className: "space-y-3", children: groups.map((g) => {
                    const target = g.contactIds[0];
                    const sources = g.contactIds.slice(1);
                    return (_jsxs("li", { className: "rounded-xl border border-border bg-card p-4 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "inline-flex items-center gap-1.5 text-sm font-semibold text-foreground", children: [_jsx(Mail, { className: "h-3.5 w-3.5 text-muted-foreground/70" }), " ", g.email] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [g.count, " contatos com este e-mail"] })] }), _jsxs(Button, { size: "sm", loading: working === target, onClick: () => merge.mutate({ targetId: target, sourceIds: sources }), children: [_jsx(Merge, { className: "h-4 w-4" }), " Mesclar em 1"] })] }), _jsx("ul", { className: "mt-3 space-y-1 border-t border-border/50 pt-3 text-xs text-muted-foreground", children: g.contactIds.map((id, idx) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: 'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ' +
                                                (idx === 0
                                                    ? 'bg-brand-100 text-brand-700'
                                                    : 'bg-muted text-muted-foreground'), children: idx === 0 ? 'Manter' : 'Mesclar' }), _jsx("span", { className: "font-mono", children: id })] }, id))) })] }, g.email));
                }) })] }));
}
