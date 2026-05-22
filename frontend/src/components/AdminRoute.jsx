import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRoute() {
  const { autenticado, admin, carregandoSessao } = useAuth()

  if (carregandoSessao) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050b24',
          color: '#fff',
          fontFamily: '"Montserrat", sans-serif',
        }}
      >
        Carregando sessão...
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />
  }

  if (!admin) {
    return <Navigate to="/home" replace />
  }

  return <Outlet />
}