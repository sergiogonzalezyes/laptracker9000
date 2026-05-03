import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SessionList from '../components/history/SessionList';
export default function HistoryPage() {
    return (_jsxs("div", { children: [_jsx("div", { className: "section-label", style: { marginBottom: 20 }, children: "Session History" }), _jsx(SessionList, {})] }));
}
