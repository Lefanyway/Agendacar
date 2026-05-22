import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import EsqueceuSenha from './pages/EsqueceuSenha'
import Home from './pages/Home'
import DetalheCarro from './pages/DetalheCarro'
import Pagamento from './pages/Pagamento'
import Reservas from './pages/Reservas'
import Admin from './pages/Admin'

import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/carros/:id" element={<DetalheCarro />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/reservas" element={<Reservas />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}