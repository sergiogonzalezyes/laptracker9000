import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SessionList from '../components/history/SessionList';
export default function HistoryPage() {
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontWeight: 700, marginBottom: 20, fontSize: 15, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }, children: "Session History" }), _jsx(SessionList, {})] }));
}
