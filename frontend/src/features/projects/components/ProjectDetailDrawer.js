import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { HEALTH_LABELS, projectsApi, STATUS_LABELS, } from '@/api/projects.api';
import { HealthBadge } from './HealthBadge';
import { ProgressBar } from './ProgressBar';
export function ProjectDetailDrawer({ projectId, open, onClose }) {
    const qc = useQueryClient();
    const [tab, setTab] = useState('overview');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [health, setHealth] = useState('ON_TRACK');
    const [endDate, setEndDate] = useState('');
    const [editing, setEditing] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const { data: project } = useQuery({
        queryKey: ['projects', projectId],
        queryFn: () => projectsApi.one(projectId),
        enabled: !!projectId && open,
    });
    const { data: tasks = [] } = useQuery({
        queryKey: ['project-tasks', projectId],
        queryFn: () => projectsApi.listTasks(projectId),
        enabled: !!projectId && open && tab === 'tasks',
    });
    useEffect(() => {
        if (project) {
            setTitle(project.title);
            setDescription(project.description ?? '');
            setHealth(project.health);
            setEndDate(project.endDate ?? '');
            setEditing(false);
            setTab('overview');
        }
    }, [project?.id]);
    function invalidate() {
        qc.invalidateQueries({ queryKey: ['projects'] });
        qc.invalidateQueries({ queryKey: ['projects-summary'] });
        qc.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    }
    const updateMut = useMutation({
        mutationFn: () => projectsApi.update(projectId, {
            title: title.trim(),
            description: description.trim() || null,
            health,
            endDate: endDate || null,
        }),
        onSuccess: () => {
            invalidate();
            setEditing(false);
        },
    });
    const completeMut = useMutation({
        mutationFn: () => projectsApi.complete(projectId),
        onSuccess: () => invalidate(),
    });
    const archiveMut = useMutation({
        mutationFn: () => projectsApi.archive(projectId),
        onSuccess: () => {
            invalidate();
            onClose();
        },
    });
    const deleteMut = useMutation({
        mutationFn: () => projectsApi.remove(projectId),
        onSuccess: () => {
            invalidate();
            onClose();
        },
    });
    const newTaskMut = useMutation({
        mutationFn: () => projectsApi.createTask(projectId, { title: newTaskTitle.trim() }),
        onSuccess: () => {
            setNewTaskTitle('');
            invalidate();
        },
    });
    const toggleTaskMut = useMutation({
        mutationFn: (id) => projectsApi.toggleTaskDone(id),
        onSuccess: () => invalidate(),
    });
    const deleteTaskMut = useMutation({
        mutationFn: (id) => projectsApi.deleteTask(id),
        onSuccess: () => invalidate(),
    });
    return (_jsx(Drawer, { open: open, onClose: onClose, width: "lg", title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "truncate", children: project?.title ?? 'Projeto' }), project && (_jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: STATUS_LABELS[project.status] }))] }), headerActions: project &&
            project.status === 'OPEN' && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("button", { type: "button", onClick: () => completeMut.mutate(), title: "Concluir", className: "inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success hover:bg-success/20", children: [_jsx(CheckCircle2, { className: "h-3.5 w-3.5" }), " Concluir"] }), _jsx("button", { type: "button", onClick: () => archiveMut.mutate(), className: "rounded-md px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted", children: "Arquivar" }), _jsx("button", { type: "button", onClick: () => {
                        if (confirm('Apagar projeto?'))
                            deleteMut.mutate();
                    }, "aria-label": "Apagar", className: "grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })), children: project && (_jsxs("div", { className: "flex h-full flex-col", children: [_jsx("nav", { className: "flex gap-1 border-b border-border px-5", children: [
                        ['overview', 'Visão geral'],
                        ['tasks', 'Tarefas'],
                        ['deals', 'Negócios vinculados'],
                    ].map(([k, label]) => (_jsxs("button", { type: "button", onClick: () => setTab(k), className: `relative px-3 py-2.5 text-sm font-medium transition-colors ${tab === k ? 'text-brand-700' : 'text-muted-foreground hover:text-foreground'}`, children: [label, tab === k && (_jsx("span", { className: "absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" }))] }, k))) }), _jsxs("div", { className: "flex-1 space-y-4 overflow-y-auto p-5", children: [tab === 'overview' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "rounded-lg border border-border p-3", children: [_jsx(ProgressBar, { value: project.progress }), _jsxs("div", { className: "mt-2 flex justify-between text-xs", children: [_jsx(HealthBadge, { value: project.health }), project.endDate && (_jsxs("span", { className: "text-muted-foreground", children: ["Prevista: ", new Date(project.endDate).toLocaleDateString('pt-BR')] }))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Field, { label: "T\u00EDtulo", value: title, onChange: setTitle, editing: editing }), _jsx(SelectField, { label: "Sa\u00FAde", value: health, onChange: (v) => setHealth(v), options: Object.entries(HEALTH_LABELS).map(([k, v]) => ({ value: k, label: v })), editing: editing }), _jsx(Field, { label: "T\u00E9rmino previsto", value: endDate, onChange: setEndDate, editing: editing, type: "date" }), _jsxs("div", { children: [_jsx("span", { className: "field-label", children: "Criado em" }), _jsx("div", { className: "text-sm text-foreground", children: new Date(project.createdAt).toLocaleString('pt-BR') })] }), _jsx("div", { className: "col-span-2", children: _jsx(Field, { label: "Descri\u00E7\u00E3o", value: description, onChange: setDescription, editing: editing, textarea: true }) })] }), _jsx("div", { className: "flex justify-end gap-2 border-t border-border pt-4", children: !editing ? (_jsx("button", { type: "button", onClick: () => setEditing(true), className: "h-9 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: "Editar" })) : (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => setEditing(false), className: "h-9 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground/80 hover:bg-muted/40", children: "Cancelar" }), _jsx("button", { type: "button", onClick: () => updateMut.mutate(), disabled: updateMut.isPending, className: "h-9 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: updateMut.isPending ? 'Salvando...' : 'Salvar' })] })) })] })), tab === 'tasks' && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { value: newTaskTitle, onChange: (e) => setNewTaskTitle(e.target.value), onKeyDown: (e) => {
                                                if (e.key === 'Enter' && newTaskTitle.trim()) {
                                                    e.preventDefault();
                                                    newTaskMut.mutate();
                                                }
                                            }, placeholder: "Nova tarefa...", className: "h-9 flex-1 rounded-md border border-border px-2 text-sm" }), _jsxs("button", { type: "button", onClick: () => newTaskMut.mutate(), disabled: !newTaskTitle.trim() || newTaskMut.isPending, className: "inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50", children: [_jsx(Plus, { className: "h-4 w-4" }), " Adicionar"] })] }), tasks.length === 0 && (_jsx("p", { className: "py-4 text-center text-sm text-muted-foreground", children: "Sem tarefas ainda." })), tasks.map((t) => (_jsxs("div", { className: "flex items-center gap-2 rounded-md border border-border p-2", children: [_jsx("input", { type: "checkbox", checked: t.done, onChange: () => toggleTaskMut.mutate(t.id), className: "h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500" }), _jsx("span", { className: `flex-1 text-sm ${t.done ? 'text-muted-foreground/70 line-through' : 'text-foreground'}`, children: t.title }), _jsx("button", { type: "button", onClick: () => deleteTaskMut.mutate(t.id), className: "grid h-7 w-7 place-items-center rounded text-muted-foreground/70 hover:bg-muted hover:text-danger", "aria-label": "Apagar", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) })] }, t.id)))] })), tab === 'deals' && (_jsxs("div", { className: "rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground", children: ["Vincula\u00E7\u00E3o a neg\u00F3cios estar\u00E1 dispon\u00EDvel em breve.", _jsx("br", {}), "Endpoint: ", _jsx("code", { children: "POST /projects/:id/deal-links" })] }))] })] })) }));
}
function Field({ label, value, onChange, editing, textarea, type = 'text', }) {
    return (_jsxs("div", { children: [_jsx("span", { className: "field-label", children: label }), editing ? (textarea ? (_jsx("textarea", { value: value, onChange: (e) => onChange(e.target.value), rows: 3, className: "w-full rounded-md border border-border px-2 py-1.5 text-sm" })) : (_jsx("input", { type: type, value: value, onChange: (e) => onChange(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm" }))) : (_jsx("div", { className: "text-sm text-foreground", children: value || '—' }))] }));
}
function SelectField({ label, value, onChange, options, editing, }) {
    if (!editing) {
        return (_jsxs("div", { children: [_jsx("span", { className: "field-label", children: label }), _jsx("div", { className: "text-sm text-foreground", children: options.find((o) => o.value === value)?.label ?? '—' })] }));
    }
    return (_jsxs("label", { className: "block", children: [_jsx("span", { className: "field-label", children: label }), _jsx("select", { value: value, onChange: (e) => onChange(e.target.value), className: "h-9 w-full rounded-md border border-border px-2 text-sm", children: options.map((o) => (_jsx("option", { value: o.value, children: o.label }, o.value))) })] }));
}
