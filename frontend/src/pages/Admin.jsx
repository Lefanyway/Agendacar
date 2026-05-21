import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, LayoutDashboard } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import api from '../services/api'
import SubtleBackground from '../components/SubtleBackground'

const VAZIO = {
  nome: '', tipo: '', imagem: '', capacidade: '',
  transmissao: 'Automático', tanque: '', precoDia: '', disponivel: true,
}

export default function Admin() {
  const [carros, setCarros] = useState([])
  const [form, setForm] = useState(VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [msg, setMsg] = useState({ tipo: '', texto: '' })

  async function carregar() {
    const { data } = await api.get('/carros')
    setCarros(data)
  }

  useEffect(() => { carregar() }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg({ tipo: '', texto: '' })
    try {
      if (editandoId) {
        await api.put(`/carros/${editandoId}`, form)
        setMsg({ tipo: 'sucesso', texto: 'Carro atualizado!' })
      } else {
        await api.post('/carros', form)
        setMsg({ tipo: 'sucesso', texto: 'Carro cadastrado!' })
      }
      setForm(VAZIO)
      setEditandoId(null)
      carregar()
      setTimeout(() => setMsg({ tipo: '', texto: '' }), 3000)
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.response?.data?.erro || 'Erro ao salvar.' })
    }
  }

  function editar(carro) {
    setForm({ ...carro })
    setEditandoId(carro.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function excluir(id) {
    if (!window.confirm('Excluir este carro permanentemente?')) return
    await api.delete(`/carros/${id}`)
    carregar()
  }

  const formatBRL = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v)

  return (
    <div className="min-h-screen">
      <SubtleBackground />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 bg-brand-deeper rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Painel Admin</h1>
            <p className="text-gray-400 text-sm">Gestão de frota</p>
          </div>
        </motion.div>

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            {editandoId ? <Pencil size={16} className="text-brand-blue" /> : <Plus size={16} className="text-brand-blue" />}
            {editandoId ? 'Editar carro' : 'Adicionar novo carro'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'nome', label: 'Nome do carro', type: 'text', placeholder: 'Ex: Porsche 911' },
              { name: 'tipo', label: 'Tipo', type: 'text', placeholder: 'Sport, SUV, Picape...' },
              { name: 'imagem', label: 'Caminho da imagem', type: 'text', placeholder: '/img/porsche.png' },
              { name: 'capacidade', label: 'Capacidade (pessoas)', type: 'number', placeholder: '5' },
              { name: 'tanque', label: 'Tanque (litros)', type: 'number', placeholder: '64' },
              { name: 'precoDia', label: 'Preço por dia (R$)', type: 'number', placeholder: '3500' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Transmissão</label>
              <select name="transmissao" value={form.transmissao} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-blue bg-gray-50">
                <option>Automático</option>
                <option>Manual</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <input type="checkbox" name="disponivel" id="disponivel"
                checked={form.disponivel} onChange={handleChange}
                className="w-4 h-4 accent-brand-blue" />
              <label htmlFor="disponivel" className="text-sm font-medium text-gray-700 cursor-pointer">
                Disponível para aluguel
              </label>
            </div>

            {msg.texto && (
              <div className="sm:col-span-2">
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${
                    msg.tipo === 'erro' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'
                  }`}
                >
                  {msg.tipo === 'erro' ? <X size={14} /> : <Check size={14} />}
                  {msg.texto}
                </motion.p>
              </div>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit"
                className="flex items-center gap-2 bg-brand-deeper hover:bg-brand-dark text-white font-semibold px-6 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg shadow-brand-deeper/20">
                {editandoId ? <Check size={14} /> : <Plus size={14} />}
                {editandoId ? 'Salvar alterações' : 'Adicionar carro'}
              </button>
              {editandoId && (
                <button type="button"
                  onClick={() => { setForm(VAZIO); setEditandoId(null); setMsg({ tipo: '', texto: '' }) }}
                  className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm transition-all">
                  <X size={14} />
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Tabela */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800 text-sm">Frota cadastrada ({carros.length} carros)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  {['Carro', 'Tipo', 'Preço/dia', 'Transmissão', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {carros.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-gray-900 whitespace-nowrap">{c.nome}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs uppercase tracking-wide">{c.tipo}</td>
                    <td className="px-5 py-3.5 font-bold text-brand-deeper whitespace-nowrap">{formatBRL(c.precoDia)}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.transmissao}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        c.disponivel ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {c.disponivel ? 'Disponível' : 'Indisponível'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => editar(c)}
                          className="flex items-center gap-1 text-xs text-brand-blue hover:text-brand-deeper font-medium px-2.5 py-1 rounded-lg hover:bg-brand-blue/10 transition-all">
                          <Pencil size={11} />
                          Editar
                        </button>
                        <button onClick={() => excluir(c.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1 rounded-lg hover:bg-red-50 transition-all">
                          <Trash2 size={11} />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
