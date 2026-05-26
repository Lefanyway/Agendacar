import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Car, CalendarCheck, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const links = [
    { to: '/home', label: 'Carros', Icon: Car },
    { to: '/reservas', label: 'Minhas Reservas', Icon: CalendarCheck },
    ...(usuario?.role === 'admin' ? [{ to: '/admin', label: 'Admin', Icon: LayoutDashboard }] : []),
  ]

  const linkClass = (path) =>
    `flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
      location.pathname === path
        ? 'bg-brand-blue/20 text-white'
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`

  return (
    <nav className="bg-brand-dark shadow-xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/home" className="shrink-0" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 900,
            fontSize: '1.25rem',
            letterSpacing: '0.22em',
            color: '#ffffff',
          }}>
            AGENDA<span style={{ color: '#60a5fa' }}>CAR</span>
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className={linkClass(to)}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Direita desktop */}
        <div className="hidden md:flex items-center gap-3">
          {usuario && (
            <span className="text-white/60 text-sm font-medium">
              Olá, <span className="text-white font-semibold">{usuario.nome.split(' ')[0]}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>

        {/* Menu mobile */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuAberto(v => !v)}
        >
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Dropdown mobile */}
      {menuAberto && (
        <div className="md:hidden bg-brand-dark border-t border-white/10 px-4 pb-4 space-y-1">
          {links.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuAberto(false)}
              className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      )}
    </nav>
  )
}
