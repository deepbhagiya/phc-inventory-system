import { useState } from 'react';
import { LayoutDashboard, Package, LogOut, User, History, Truck, ShoppingCart, FileText, ShoppingBag, Menu, X } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout = ({ user, onLogout }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Home' },
    { path: '/issue-medicine', icon: ShoppingBag, label: 'Issue' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/transactions', icon: History, label: 'History' },
    { path: '/suppliers', icon: Truck, label: 'Suppliers' },
    { path: '/reorders', icon: ShoppingCart, label: 'Reorders' },
    { path: '/audit', icon: FileText, label: 'Audit' },
  ];

  const bottomNavItems = navItems.slice(0, 4);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', backgroundColor: 'var(--background)' }}>
      {/* Top App Bar */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem', 
        backgroundColor: 'var(--surface, #1e1e1e)', 
        color: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <User size={16} />
          </div>
          <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{user?.username || 'User'}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{user?.role || 'Staff'}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#ef4444', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <LogOut size={20} />
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'block', background: 'none', border: 'none', color: '#fff', padding: '0.5rem' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu (Slide-in) */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          bottom: '60px', /* Above bottom nav */
          backgroundColor: 'var(--surface, #1a1a1a)',
          zIndex: 40,
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#888', marginBottom: '1rem', letterSpacing: '1px' }}>Menu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map(item => {
               const Icon = item.icon;
               const isActive = location.pathname === item.path;
               return (
                 <Link 
                   key={item.path}
                   to={item.path}
                   onClick={() => setMobileMenuOpen(false)}
                   style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '1rem', 
                     padding: '1rem', 
                     borderRadius: '8px', 
                     textDecoration: 'none', 
                     color: isActive ? '#3b82f6' : '#e0e0e0', 
                     backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                     fontWeight: isActive ? 'bold' : 'normal'
                   }}
                 >
                   <Icon size={22} />
                   <span style={{ fontSize: '1rem' }}>{item.label}</span>
                 </Link>
               );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1rem',
        paddingBottom: '80px', /* Space for bottom nav */
        backgroundColor: 'var(--background, #121212)'
      }}>
        <div className="container" style={{ maxWidth: '100%' }}>
            <Outlet />
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        height: '65px', 
        backgroundColor: 'var(--surface, #1e1e1e)', 
        display: 'flex', 
        justifyContent: 'space-around', 
        alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
        paddingBottom: 'env(safe-area-inset-bottom)', /* iOS Safe Area */
        zIndex: 50
      }}>
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '4px',
                textDecoration: 'none', 
                color: isActive ? '#3b82f6' : '#888', 
                padding: '0.5rem',
                flex: 1
              }}
            >
              <div style={{
                padding: '0.25rem 1rem',
                borderRadius: '16px',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                transition: 'background-color 0.2s'
              }}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
