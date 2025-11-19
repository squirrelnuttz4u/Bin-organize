import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Camera, Settings, Package } from 'lucide-react'

export default function Header() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--gray-200)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--gray-900)',
          fontWeight: 600,
          fontSize: '18px'
        }}>
          <Package size={24} color="var(--primary)" />
          Bin Organize
        </Link>

        <nav style={{ display: 'flex', gap: '4px' }}>
          <NavLink to="/" active={isActive('/')} icon={<Home size={20} />} label="Home" />
          <NavLink to="/search" active={isActive('/search')} icon={<Search size={20} />} label="Search" />
          <NavLink to="/scan" active={isActive('/scan')} icon={<Camera size={20} />} label="Scan" />
          <NavLink to="/settings" active={isActive('/settings')} icon={<Settings size={20} />} label="Settings" />
        </nav>
      </div>
    </header>
  )
}

function NavLink({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 'var(--radius)',
        color: active ? 'var(--primary)' : 'var(--gray-500)',
        background: active ? 'var(--gray-100)' : 'transparent',
        fontSize: '11px',
        textDecoration: 'none',
        transition: 'all 0.2s'
      }}
    >
      {icon}
      <span style={{ marginTop: '2px' }}>{label}</span>
    </Link>
  )
}
