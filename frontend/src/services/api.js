import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})

api.interceptors.request.use(config => {
  const sessao = localStorage.getItem('agendacar:sessao')

  if (sessao) {
    try {
      const dados = JSON.parse(sessao)

      if (dados?.token) {
        config.headers.Authorization = `Bearer ${dados.token}`
      }
    } catch {
      localStorage.removeItem('agendacar:sessao')
    }
  }

  return config
})

export default api
