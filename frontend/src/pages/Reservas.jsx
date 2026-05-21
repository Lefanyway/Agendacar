import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, XCircle, Car, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Chatbot from '../components/Chatbot'
import api from '../services/api'
import SubtleBackground from '../components/SubtleBackground'

const STATUS_STYLE = {
  ativa: 'bg-green-100 text-green-700 border-green-200',
  cancelada: 'bg-red-100 text-red-600 border-red-200',
  concluida: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function Reservas() {
  const [reservas, setReservas] = useState([])
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    try {
      const { data } = await api.get('/reservas')
      setReservas(data)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function cancelar(id) {
    if (!window.confirm('Deseja cancelar esta reserva?')) return
    await api.delete(`/reservas/${id}`)
    carregar()
  }

  const formatBRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v)

  return (
    <div className="min-h-screen">
      <SubtleBackground />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7"
        >
          <h1 className="text-2xl font-extrabold text-gray-900">Minhas Reservas</h1>
          <p className="text-gray-400 text-sm mt-1">{reservas.length} reserva{reservas.length !== 1 ? 's' : ''} encontrada{reservas.length !== 1 ? 's' : ''}</p>
        </motion.div>

        {carregando ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse h-28" />
            ))}
          </div>
        ) : reservas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car size={32} className="text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-bold text-lg mb-2">Nenhuma reserva ainda</h3>
            <p className="text-gray-400 text-sm mb-6">Explore nossos carros e faça sua primeira reserva</p>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 bg-brand-deeper text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-all hover:scale-105"
            >
              Ver carros
              <ChevronRight size={15} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {reservas.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex items-stretch">
                  {/* Imagem com fundo colorido */}
                  <div
                    className="w-32 sm:w-40 shrink-0 flex items-center justify-center p-3"
                    style={{ background: 'radial-gradient(circle at 60% 60%, #3a83f9 0%, #0056e0 100%)' }}
                  >
                    <img
                      src={r.Carro?.imagem}
                      alt={r.Carro?.nome}
                      className="w-full max-h-20 object-contain"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
                      onError={e => { e.target.src = '/img/carro.png' }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{r.Carro?.nome}</h3>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{r.Carro?.tipo}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} className="text-brand-blue" />
                          {r.dataInicio} → {r.dataFim}
                        </span>
                        {r.destino && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-brand-blue" />
                            {r.destino}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Direita */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[r.status] || STATUS_STYLE.ativa}`}>
                        {r.status}
                      </span>
                      <p className="font-extrabold text-brand-deeper text-base">{formatBRL(r.valorTotal)}</p>
                      {r.status === 'ativa' && (
                        <button
                          onClick={() => cancelar(r.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-3 py-1.5 transition-all hover:bg-red-50"
                        >
                          <XCircle size={12} />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Chatbot />
    </div>
  )
}
