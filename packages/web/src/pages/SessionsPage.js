import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SessionList from '../components/history/SessionList';
export default function SessionsPage() {
    return (_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: { flexShrink: 0, marginBottom: 14 }, children: [_jsx("div", { style: { fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }, children: "Sessions" }), _jsx("div", { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }, children: "All recorded sessions" })] }), _jsx(SessionList, {})] }));
}
