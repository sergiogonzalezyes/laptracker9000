import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
export default function Shell() {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: [_jsx(NavBar, {}), _jsx("main", { style: { flex: 1, padding: '24px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }, children: _jsx(Outlet, {}) })] }));
}
