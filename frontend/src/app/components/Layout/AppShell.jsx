import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopNav from './TopNav.jsx';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell" data-section="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`main-content${collapsed ? ' sidebar-collapsed' : ''}`}>
        <TopNav onMobileMenu={() => setMobileOpen(true)} />
        <main>
          <Outlet />
        </main>
      </div>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'var(--color-overlay)',
          }}
        />
      )}
    </div>
  );
}
