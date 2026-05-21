import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Fuel, Settings2, Users, MapPin, CalendarDays, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Chatbot from '../components/Chatbot'
import api from '../services/api'
import SubtleBackground from '../components/SubtleBackground'

export default function DetalheCarro() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [carro, setCarro] = useState(null)
  const [form, setForm] = useState({ dataInicio: '', dataFim: '', destino: '' })
  const [msg, setMsg] = useState({ tipo: '', texto: '' })
  const [enviando, setEnviando] = useState(false)

  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.get(`/carros/${id}`)
      .then(({ data }) => setCarro(data))
      .catch(() => navigate('/home'))
  }, [id])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleReserva(e) {
    e.preventDefault()
    setMsg({ tipo: '', texto: '' })
    if (!form.dataInicio || !form.dataFim || !form.destino) {
      setMsg({ tipo: 'erro', texto: 'Preencha todos os campos.' })
      return
    }
    if (form.dataFim <= form.dataInicio) {
      setMsg({ tipo: 'erro', texto: 'A devolução deve ser depois da retirada.' })
      return
    }
    setEnviando(true)
    try {
      const diasCalc = Math.ceil((new Date(form.dataFim) - new Date(form.dataInicio)) / 86400000)
      localStorage.setItem('dadosReserva', JSON.stringify({
        CarroId: id,
        carroNome: carro.nome,
        categoria: carro.tipo,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        destino: form.destino,
        precoDia: carro.precoDia,
        dias: diasCalc,
        total: diasCalc * carro.precoDia,
      }))
      navigate('/pagamento')
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.response?.data?.erro || 'Erro ao processar.' })
    } finally {
      setEnviando(false)
    }
  }

  const dias = form.dataInicio && form.dataFim
    ? Math.ceil((new Date(form.dataFim) - new Date(form.dataInicio)) / 86400000)
    : 0

  const formatBRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v)

  if (!carro) {
    return (
      <div className="min-h-screen">
        <SubtleBackground />
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-blue border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SubtleBackground />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-brand-blue text-sm font-medium mb-6 transition-colors"
          whileHover={{ x: -3 }}
        >
          <ChevronLeft size={16} />
          Voltar para carros
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Imagem — fundo colorido igual ao card */}
            <div
              className="md:w-1/2 relative flex items-center justify-center p-10 min-h-64 overflow-hidden"
              style={{ background: 'radial-gradient(circle at 60% 60%, #3a83f9 0%, #0056e0 100%)' }}
            >
              <div className="absolute w-64 h-64 rounded-full opacity-20"
                style={{ background: '#60a5fa', filter: 'blur(50px)', top: '-40px', right: '-40px' }} />

              <motion.img
                src={carro.imagem}
                alt={carro.nome}
                className="relative z-10 max-h-56 w-full object-contain animate-float"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}
                onError={e => { e.target.src = '/img/carro.png' }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />

              <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${
                carro.disponivel ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {carro.disponivel ? 'Disponível' : 'Indisponível'}
              </span>
            </div>

            {/* Info + formulário */}
            <div className="md:w-1/2 p-7 md:p-8">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">{carro.tipo}</p>
                <h1 className="text-3xl font-extrabold text-gray-900">{carro.nome}</h1>

                {/* Specs */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {[
                    { Icon: Fuel, label: `${carro.tanque}L` },
                    { Icon: Settings2, label: carro.transmissao },
                    { Icon: Users, label: `${carro.capacidade} pessoas` },
                  ].map(({ Icon, label }) => (
                    <span key={label} className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
                      <Icon size={14} className="text-brand-blue" />
                      {label}
                    </span>
                  ))}
                </div>

                <p className="text-4xl font-extrabold text-brand-deeper mt-5 leading-none">
                  {formatBRL(carro.precoDia)}
                  <span className="text-base font-normal text-gray-400 ml-1">/dia</span>
                </p>
              </div>

              {/* Formulário de reserva */}
              <form onSubmit={handleReserva} className="space-y-3">
                {/* Local */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    <MapPin size={12} className="inline mr-1" />
                    Local de retirada
                  </label>
                  <select
                    name="destino"
                    value={form.destino}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-blue transition-all bg-gray-50 focus:bg-white"
                  >
                    <option value="">Selecione o local</option>
                    <option value="Qualquer">Qualquer</option>
                    <option value="Unifecaf">Unifecaf</option>
                  </select>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      <CalendarDays size={12} className="inline mr-1" />
                      Retirada
                    </label>
                    <input type="date" name="dataInicio" value={form.dataInicio}
                      onChange={handleChange} min={hoje}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-blue transition-all bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      <CalendarDays size={12} className="inline mr-1" />
                      Devolução
                    </label>
                    <input type="date" name="dataFim" value={form.dataFim}
                      onChange={handleChange} min={form.dataInicio || hoje}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-blue transition-all bg-gray-50 focus:bg-white" />
                  </div>
                </div>

                {/* Preview total */}
                {dias > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-deeper/5 border border-brand-deeper/15 rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">
                      {dias} dia{dias > 1 ? 's' : ''}
                    </span>
                    <span className="font-extrabold text-brand-deeper">{formatBRL(dias * carro.precoDia)}</span>
                  </motion.div>
                )}

                {/* Mensagem */}
                {msg.texto && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl border ${
                      msg.tipo === 'erro'
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-green-50 border-green-200 text-green-700'
                    }`}
                  >
                    {msg.tipo === 'erro' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                    {msg.texto}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={enviando || !carro.disponivel}
                  className="w-full bg-brand-deeper hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-brand-deeper/25 mt-1"
                >
                  {!carro.disponivel ? 'Carro indisponível' : enviando ? 'Reservando...' : 'Reservar agora'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </main>

      <Chatbot />
    </div>
  )
}
