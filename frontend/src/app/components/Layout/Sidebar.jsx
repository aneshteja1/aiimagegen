import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wand2, Image, Video, Package, Users2,
  History, Download, Settings, CreditCard, Shield, Building2,
  ChevronLeft, ChevronRight, UserCog, ImagePlus, Coins, Activity,
  Globe, LogOut,
} from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';
import { USER_ROLES } from '../../../utils/constants.js';
import { getInitials } from '../../../utils/formatters.js';

const userNav = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/swap-model',       icon: Wand2,           label: 'Swap Model' },
  { to: '/image-generation', icon: Image,           label: 'Image Generation' },
  { to: '/video-generation', icon: Video,           label: 'Video Generation' },
  { to: '/bulk-generation',  icon: Package,         label: 'Bulk Generation' },
  { to: '/avatar-library',   icon: Users2,          label: 'Avatar Library' },
  { to: '/jobs',             icon: History,         label: 'Job History' },
  { to: '/downloads',        icon: Download,        label: 'Downloads' },
];

const userBottom = [
  { to: '/billing',  icon: CreditCard, label: 'Billing' },
  { to: '/settings', icon: Settings,   label: 'Settings' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: Shield,     label: 'Admin Dashboard' },
  { to: '/admin/users',     icon: UserCog,    label: 'Users' },
  { to: '/admin/avatars',   icon: ImagePlus,  label: 'Avatars' },
  { to: '/admin/credits',   icon: Coins,      label: 'Credits' },
  { to: '/admin/jobs',      icon: Activity,   label: 'Job Monitor' },
];

const superAdminNav = [
  { to: '/superadmin/dashboard',  icon: Globe,     label: 'Global Overview' },
  { to: '/superadmin/companies',  icon: Building2, label: 'Companies' },
  { to: '/superadmin/settings',   icon: Settings,  label: 'System Settings' },
];

function NavItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '10px 0' : '9px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: isActive ? 600 : 400,
        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        background: isActive ? 'var(--color-surface)' : 'transparent',
        textDecoration: 'none',
        transition: 'background var(--transition-fast), color var(--transition-fast)',
        minHeight: 36,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      })}
    >
      <Icon size={16} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

function SectionLabel({ label, collapsed }) {
  if (collapsed) return <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 12px' }} />;
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', padding: '8px 12px 4px' }}>
      {label}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) {
  const { user, logout, isSuperAdmin, isCompanyAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    zIndex: 40,
    width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
    background: 'var(--color-background)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width var(--transition-base), transform var(--transition-base)',
    overflow: 'hidden',
  };

  // Mobile: slide in from left
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    sidebarStyle.transform = mobileOpen ? 'translateX(0)' : 'translateX(-100%)';
    sidebarStyle.width = 'var(--sidebar-width)';
  }

  return (
    <aside style={sidebarStyle} data-section="sidebar">
      {/* Logo + toggle */}
      <div style={{
        height: 'var(--topnav-height)',
        display: 'flex', alignItems: 'center',
        padding: collapsed ? '0' : '0 12px',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', letterSpacing: '-0.01em' }}>
            AI Fashion Studio
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'transparent',
            color: 'var(--color-text-muted)', cursor: 'pointer',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 8px 0' }}>
        {userNav.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        {/* Admin section — only rendered for admins (not just hidden) */}
        {isCompanyAdmin() && !isSuperAdmin() && (
          <>
            <SectionLabel label="Admin" collapsed={collapsed} />
            {adminNav.map(item => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
          </>
        )}

        {/* Super Admin section */}
        {isSuperAdmin() && (
          <>
            <SectionLabel label="Super Admin" collapsed={collapsed} />
            {superAdminNav.map(item => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
            <SectionLabel label="Admin" collapsed={collapsed} />
            {adminNav.map(item => (
              <NavItem key={item.to} {...item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom: user info + settings */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--color-border)' }}>
        {userBottom.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '10px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            background: 'transparent', border: 'none',
            width: '100%', cursor: 'pointer',
            transition: 'color var(--transition-fast)',
            minHeight: 36,
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Log out</span>}
        </button>

        {!collapsed && user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            borderTop: '1px solid var(--color-border)',
            marginTop: 4,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--color-action)',
              color: 'var(--color-text-inverse)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, flexShrink: 0,
            }}>
              {getInitials(user.full_name)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
