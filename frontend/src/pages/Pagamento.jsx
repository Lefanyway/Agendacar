import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock, CheckCircle, AlertCircle, ChevronLeft, Calendar, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import api from '../services/api'

/* ─── helpers de formatação ─── */
function fmtMoeda(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function fmtDataLong(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  const meses = ['janeiro','fevereiro','março','abril','maio','junho',
                 'julho','agosto','setembro','outubro','novembro','dezembro']
  return `${dia} de ${meses[+mes - 1]} de ${ano}`
}
function fmtCPF(v) {
  v = v.replace(/\D/g, '')
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  return v.slice(0, 14)
}
function fmtNasc(v) {
  v = v.replace(/\D/g, '')
  if (v.length > 2)  v = v.slice(0,2)  + '/' + v.slice(2)
  if (v.length > 5)  v = v.slice(0,5)  + '/' + v.slice(5)
  return v.slice(0, 10)
}

/* ─── componente visual do cartão ─── */
function CreditCardVisual({ numero, nome, validade, bandeira }) {
  const gradient = {
    visa:       'linear-gradient(135deg, #1a1f71 0%, #2b32b2 100%)',
    mastercard: 'linear-gradient(135deg, #1a1a1a 0%, #444 100%)',
    default:    'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)',
  }[bandeira]

  const numDisplay = (numero.replace(/\s/g, '').padEnd(16, '•'))
    .match(/.{1,4}/g).join(' ')

  return (
    <motion.div
      className="relative rounded-2xl text-white select-none overflow-hidden"
      style={{
        width: '280px',
        height: '175px',
        background: gradient,
        boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
        fontFamily: '"Courier New", monospace',
        transition: 'background 0.6s ease',
      }}
      animate={{ rotateY: [0, 2, 0] }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      key={bandeira}
    >
      {/* brilho */}
      <div className="absolute inset-0 rounded-2xl"
        style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), transparent 60%)' }} />

      {/* chip + logo */}
      <div className="relative flex justify-between items-start p-5 pb-0">
        <div className="w-10 h-7 rounded-md"
          style={{ background: 'linear-gradient(135deg, #ffd700, #b8860b)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
        <BandeiraSVG bandeira={bandeira} />
      </div>

      {/* número */}
      <p className="relative px-5 mt-3 text-lg tracking-[3px] font-bold"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
        {numDisplay}
      </p>

      {/* rodapé */}
      <div className="relative flex justify-between px-5 pb-5 pt-2 text-[10px] uppercase">
        <div>
          <p className="opacity-60 mb-0.5">Nome impresso</p>
          <p className="font-bold text-sm tracking-wide truncate max-w-[150px]">
            {nome.toUpperCase() || 'NOME DO TITULAR'}
          </p>
        </div>
        <div className="text-right">
          <p className="opacity-60 mb-0.5">Validade</p>
          <p className="font-bold text-sm">{validade || '••/••'}</p>
        </div>
      </div>
    </motion.div>
  )
}

function BandeiraSVG({ bandeira }) {
  if (bandeira === 'visa') {
    return (
      <div className="text-white font-extrabold text-2xl italic tracking-tight"
        style={{ fontFamily: 'serif', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
        VISA
      </div>
    )
  }
  if (bandeira === 'mastercard') {
    return (
      <div className="flex items-center gap-[-4px]">
        <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
        <div className="w-7 h-7 rounded-full bg-yellow-400 opacity-90 -ml-3" />
      </div>
    )
  }
  return <CreditCard size={28} className="text-white/60" />
}

/* ─── helpers de input ─── */
function InputField({ label, icon: Icon, error, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          {...props}
          className={`w-full border rounded-xl ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm outline-none transition-all bg-gray-50 focus:bg-white
            ${error ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15'}
          `}
        />
      </div>
    </div>
  )
}

/* ─── página principal ─── */
export default function Pagamento() {
  const navigate = useNavigate()
  const [dados, setDados]       = useState(null)
  const [card, setCard]         = useState({ numero: '', nome: '', validade: '', cvv: '' })
  const [extra, setExtra]       = useState({ apelido: '', cpf: '', nascimento: '', parcelas: '' })
  const [bandeira, setBandeira] = useState('default')
  const [erros, setErros]       = useState({})
  const [sucesso, setSucesso]   = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [apiErr, setApiErr]     = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('dadosReserva')
    if (!raw) { navigate('/home'); return }
    setDados(JSON.parse(raw))
  }, [])

  /* detectar bandeira */
  function detectarBandeira(num) {
    const n = num.replace(/\s/g, '')
    if (n.startsWith('4'))           return 'visa'
    if (/^5[1-5]/.test(n))          return 'mastercard'
    return 'default'
  }

  function handleNumero(e) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16)
    v = v.match(/.{1,4}/g)?.join(' ') || v
    setCard(c => ({ ...c, numero: v }))
    setBandeira(detectarBandeira(v))
    setErros(e2 => ({ ...e2, numero: '' }))
  }

  function handleValidade(e) {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length >= 2) {
      let m = +v.slice(0, 2)
      if (m > 12) m = 12
      if (m === 0) m = 1
      v = String(m).padStart(2, '0') + v.slice(2)
    }
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4)
    setCard(c => ({ ...c, validade: v.slice(0, 5) }))
    setErros(e2 => ({ ...e2, validade: '' }))
  }

  /* validação */
  function validar() {
    const e = {}
    if (!card.numero || card.numero.replace(/\s/g,'').length < 16) e.numero = true
    if (!card.nome.trim())                                          e.nome = true
    if (!card.validade || card.validade.length < 5)                 e.validade = true
    if (!card.cvv || card.cvv.length < 3)                          e.cvv = true
    if (!extra.apelido.trim())                                      e.apelido = true
    if (!extra.cpf || extra.cpf.replace(/\D/g,'').length < 11)     e.cpf = true
    if (!extra.nascimento || extra.nascimento.length < 10)          e.nascimento = true
    if (!extra.parcelas)                                            e.parcelas = true
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function finalizar(e) {
    e.preventDefault()
    setApiErr('')
    if (!validar()) return

    setEnviando(true)
    try {
      if (dados?.CarroId) {
        await api.post('/reservas', {
  carroId: Number(dados.CarroId),
  dataInicio: dados.dataInicio,
  dataFim: dados.dataFim,
  destino: dados.destino,
})
      }
      localStorage.removeItem('dadosReserva')
      setSucesso(true)
    } catch (err) {
      setApiErr(err.response?.data?.erro || 'Erro ao processar pagamento.')
    } finally {
      setEnviando(false)
    }
  }

  if (!dados) return null

  const dias    = dados.dias || 1
  const total   = dados.total || 0
  const parcelas = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-brand-blue text-sm font-medium mb-6 transition-colors"
          whileHover={{ x: -3 }}>
          <ChevronLeft size={16} />
          Voltar
        </motion.button>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Coluna pagamento ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-[2] bg-white rounded-2xl shadow-sm overflow-hidden"
            style={{ borderTop: '5px solid #0d2459' }}
          >
            {/* header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-4 h-4 rounded-full border-4" style={{ borderColor: '#0d2459' }} />
              <h2 className="font-bold text-base uppercase tracking-wide" style={{ color: '#0d2459' }}>
                Cartão de Crédito
              </h2>
              <CreditCard size={20} className="ml-auto" style={{ color: '#0d2459' }} />
            </div>

            <div className="p-6 flex flex-wrap gap-8">
              {/* Visual do cartão */}
              <div className="flex flex-col items-center gap-4">
                <CreditCardVisual
                  numero={card.numero}
                  nome={card.nome}
                  validade={card.validade}
                  bandeira={bandeira}
                />
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" style={{ accentColor: '#0d2459' }} />
                  Este é meu cartão padrão
                </label>
              </div>

              {/* Formulário */}
              <form onSubmit={finalizar} className="flex-1 min-w-[240px] flex flex-col gap-4">
                {/* número */}
                <InputField label="Número do cartão *" icon={CreditCard}
                  value={card.numero} onChange={handleNumero}
                  placeholder="0000 0000 0000 0000" maxLength={19} error={erros.numero} />

                {/* nome */}
                <InputField label="Nome impresso no cartão *" icon={User}
                  value={card.nome} onChange={e => { setCard(c => ({...c, nome: e.target.value})); setErros(e2=>({...e2,nome:''})) }}
                  placeholder="NOME SOBRENOME" error={erros.nome} />

                {/* validade + cvv */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Validade *" icon={Calendar}
                    value={card.validade} onChange={handleValidade}
                    placeholder="MM/AA" maxLength={5} error={erros.validade} />
                  <InputField label="CVV *" icon={Lock}
                    value={card.cvv}
                    onChange={e => { setCard(c=>({...c, cvv: e.target.value.replace(/\D/g,'').slice(0,3)})); setErros(e2=>({...e2,cvv:''})) }}
                    placeholder="123" maxLength={3} error={erros.cvv} />
                </div>

                {/* apelido */}
                <InputField label="Apelido do cartão *"
                  value={extra.apelido} onChange={e => { setExtra(x=>({...x,apelido:e.target.value})); setErros(e2=>({...e2,apelido:''})) }}
                  placeholder="Ex: Meu Visa pessoal" error={erros.apelido} />

                {/* cpf + nascimento */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="CPF do titular *"
                    value={extra.cpf}
                    onChange={e => { setExtra(x=>({...x, cpf: fmtCPF(e.target.value)})); setErros(e2=>({...e2,cpf:''})) }}
                    placeholder="000.000.000-00" maxLength={14} error={erros.cpf} />
                  <InputField label="Nascimento *"
                    value={extra.nascimento}
                    onChange={e => { setExtra(x=>({...x, nascimento: fmtNasc(e.target.value)})); setErros(e2=>({...e2,nascimento:''})) }}
                    placeholder="DD/MM/AAAA" maxLength={10} error={erros.nascimento} />
                </div>

                {/* parcelamento */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Parcelamento *</label>
                  <select value={extra.parcelas}
                    onChange={e => { setExtra(x=>({...x,parcelas:e.target.value})); setErros(e2=>({...e2,parcelas:''})) }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-gray-50 focus:bg-white
                      ${erros.parcelas ? 'border-red-400' : 'border-gray-200 focus:border-brand-blue'}`}>
                    <option value="">Selecione o parcelamento</option>
                    {parcelas.map(i => (
                      <option key={i} value={i}>
                        {i}x de {fmtMoeda(total / i)}{i > 1 ? ' com encargos' : ' sem juros'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* erro geral */}
                <AnimatePresence>
                  {(Object.keys(erros).length > 0 || apiErr) && (
                    <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                      <AlertCircle size={14} />
                      {apiErr || 'Preencha todos os campos obrigatórios.'}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={enviando}
                  className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-lg mt-1"
                  style={{ backgroundColor: '#0d2459', letterSpacing: '1.5px' }}>
                  {enviando
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Lock size={15} />}
                  {enviando ? 'Processando...' : 'Finalizar Pagamento'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* ── Coluna resumo ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
            style={{ borderTop: '5px solid #0d2459' }}
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-base" style={{ color: '#0d2459' }}>Resumo da Reserva</h2>
            </div>

            <div className="flex-1 p-5 space-y-5">
              {[
                { label: 'Retirada', data: fmtDataLong(dados.dataInicio || dados.dataRetirada), loc: dados.destino },
                { label: 'Devolução', data: fmtDataLong(dados.dataFim || dados.dataDevolucao), loc: dados.destino },
              ].map(item => (
                <div key={item.label} className="border-b border-gray-100 pb-4">
                  <p className="font-bold text-base mb-1" style={{ color: '#0d2459' }}>{item.label}</p>
                  <p className="font-semibold text-gray-800 text-sm">{item.data}</p>
                  {item.loc && <p className="text-gray-400 text-xs mt-0.5">{item.loc}</p>}
                </div>
              ))}

              <div>
                <p className="font-bold text-base mb-1" style={{ color: '#0d2459' }}>Veículo</p>
                <p className="font-bold text-gray-900">{dados.carroNome || '—'}</p>
                <p className="text-gray-400 text-xs">{dados.categoria || ''}</p>
              </div>
            </div>

            {/* rodapé azul */}
            <div className="p-5 text-center text-white rounded-b-2xl"
              style={{ backgroundColor: '#0d2459' }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#aabbd6' }}>
                Valor total previsto
              </p>
              <p className="text-3xl font-extrabold">{fmtMoeda(total)}</p>
              <p className="text-xs mt-1 font-semibold text-white/80">
                {dias} diária{dias > 1 ? 's' : ''}{' '}
                {dados.precoDia ? `· ${fmtMoeda(dados.precoDia)}/dia` : ''}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Modal de sucesso ── */}
      <AnimatePresence>
        {sucesso && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-[90%] text-center shadow-2xl"
            >
              {/* ícone animado */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 18 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: '#0d2459' }}
              >
                <CheckCircle size={44} className="text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-2xl font-extrabold text-gray-900 mb-2"
              >
                Pagamento confirmado!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="text-gray-500 text-sm mb-6"
              >
                Sua reserva foi efetuada com sucesso. Aproveite a viagem!
              </motion.p>

              {/* confetes animados */}
              {[...Array(8)].map((_, i) => (
                <motion.div key={i}
                  className="absolute w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    background: ['#0d2459','#3b82f6','#fbbf24','#10b981','#f43f5e'][i % 5],
                    top: '30%', left: `${10 + i * 12}%`,
                  }}
                  initial={{ y: 0, opacity: 1, scale: 0 }}
                  animate={{ y: -80 - Math.random()*60, opacity: 0, scale: [0, 1.5, 0] }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.9 }}
                />
              ))}

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                onClick={() => navigate('/reservas')}
                className="w-full text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                style={{ backgroundColor: '#0d2459' }}
              >
                Ver minhas reservas
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
