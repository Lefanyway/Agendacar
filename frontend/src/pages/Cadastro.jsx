import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../services/api'
import AnimatedScene from '../components/AnimatedScene'

export default function Cadastro() {
  const [form, setForm]           = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [senhaVisivel, setVis]    = useState(false)
  const [erro, setErro]           = useState('')
  const [sucesso, setSucesso]     = useState(false)
  const [carregando, setLoad]     = useState(false)
  const navigate                  = useNavigate()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (form.senha !== form.confirmar) { setErro('As senhas não coincidem.'); return }
    if (form.senha.length < 6)         { setErro('Mínimo 6 caracteres.'); return }
    setLoad(true)
    try {
      await api.post('/auth/cadastrar', { nome: form.nome, email: form.email, senha: form.senha })
      setSucesso(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar.')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Lado esquerdo: cena animada ── */}
      <div className="hidden lg:block w-[52%] relative overflow-hidden">
        <AnimatedScene />

        {/* Conteúdo sobre a cena */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-10 px-8 pointer-events-none">
          <motion.img
            src="/img/Agendacarlog.png"
            alt="AgendaCar"
            style={{ width: '420px', maxWidth: '88%', mixBlendMode: 'lighten' }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          <motion.p
            className="text-white/70 text-lg font-light tracking-[0.22em] uppercase mt-2 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            Agende · Dirija · Explore
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
          >
            {['Cadastro gratuito', 'Sem taxa de adesão', 'Cancele quando quiser'].map(t => (
              <span key={t} className="text-xs font-semibold px-4 py-1.5 rounded-full text-white/80"
                style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(6px)' }}>
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Lado direito ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
        <motion.div className="w-full max-w-md py-4"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          <div className="lg:hidden flex justify-center mb-8">
            <div className="p-4 rounded-2xl" style={{ backgroundColor: '#0d2459' }}>
              <img src="/img/Agendacarlog.png" alt="AgendaCar" className="w-40" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Criar sua conta</h1>
          <p className="text-gray-400 text-sm mb-8">Junte-se ao AgendaCar hoje mesmo</p>

          {sucesso ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10">
              <CheckCircle size={60} className="mx-auto mb-4" style={{ color: '#0d2459' }} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Conta criada com sucesso!</h2>
              <p className="text-gray-500 text-sm">Redirecionando para o login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome completo</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="nome" value={form.nome} onChange={handleChange}
                    placeholder="Seu nome" required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="seu@email.com" required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={senhaVisivel ? 'text' : 'password'} name="senha" value={form.senha}
                    onChange={handleChange} placeholder="Mínimo 6 caracteres" required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all bg-gray-50 focus:bg-white" />
                  <button type="button" onClick={() => setVis(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {senhaVisivel ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" name="confirmar" value={form.confirmar}
                    onChange={handleChange} placeholder="Repita a senha" required
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>

              {erro && (
                <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {erro}
                </motion.p>
              )}

              <button type="submit" disabled={carregando}
                className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-lg"
                style={{ backgroundColor: '#0d2459' }}>
                {carregando
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <UserPlus size={16} />}
                {carregando ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-blue font-semibold hover:underline">Entrar</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
