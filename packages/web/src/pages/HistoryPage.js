import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SessionList from '../components/history/SessionList';
export default function HistoryPage() {
    return (_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }, children: [_jsx("div", { className: "section-label", style: { flexShrink: 0, marginBottom: 12 }, children: "Session History" }), _jsx(SessionList, {})] }));
}
