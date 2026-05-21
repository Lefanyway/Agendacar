import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('usuario')
    if (t && u) {
      setToken(t)
      setUsuario(JSON.parse(u))
    }
  }, [])

  function login(novoToken, dadosUsuario) {
    localStorage.setItem('token', novoToken)
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario))
    setToken(novoToken)
    setUsuario(dadosUsuario)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
