import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext({})

const STORAGE_KEY = 'agendacar:sessao'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [carregandoSessao, setCarregandoSessao] = useState(true)

  useEffect(() => {
    async function carregarSessao() {
      const sessaoSalva = localStorage.getItem(STORAGE_KEY)

      if (!sessaoSalva) {
        setCarregandoSessao(false)
        return
      }

      try {
        const dados = JSON.parse(sessaoSalva)

        if (!dados?.token) {
          localStorage.removeItem(STORAGE_KEY)
          setCarregandoSessao(false)
          return
        }

        setToken(dados.token)

        const response = await api.get('/auth/me')

        setUsuario(response.data)

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            token: dados.token,
            usuario: response.data,
          }),
        )
      } catch (error) {
        console.error('Sessão inválida:', error)

        localStorage.removeItem(STORAGE_KEY)
        setUsuario(null)
        setToken(null)
      } finally {
        setCarregandoSessao(false)
      }
    }

    carregarSessao()
  }, [])

  async function login(email, senha) {
    const response = await api.post('/auth/login', {
      email,
      senha,
    })

    const dados = response.data

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: dados.token,
        usuario: dados.usuario,
      }),
    )

    setToken(dados.token)
    setUsuario(dados.usuario)

    return dados.usuario
  }

  async function cadastrar(nome, email, senha) {
    const response = await api.post('/auth/cadastrar', {
      nome,
      email,
      senha,
    })

    return response.data
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUsuario(null)
    setToken(null)
  }

  const autenticado = Boolean(token && usuario)
  const admin = usuario?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado,
        admin,
        carregandoSessao,
        login,
        cadastrar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}