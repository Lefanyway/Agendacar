import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const INTENTS_COM_CARDS = new Set([
  'reservar_carro',
  'consultar_carros',
  'consultar_modelo',
  'filtros_carros',
  'recomendacao_carro',
  'recomendar_carro',
])

const INTENTS_SEM_CARDS = new Set([
  'cancelar_reserva',
  'alterar_reserva',
  'minhas_reservas',
  'consultar_reserva',
  'pagamento',
  'login_cadastro',
  'problema_login',
  'area_admin',
  'fora_escopo',
  'suporte_humano',
  'fallback',
])

function normalizarTexto(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function pareceFluxoSemCards(textoUsuario, intent) {
  const texto = normalizarTexto(textoUsuario)
  const intentNormalizada = normalizarTexto(intent)

  if (INTENTS_SEM_CARDS.has(intentNormalizada)) {
    return true
  }

  const falaDeReserva =
    /\b(reserva|reservas|agendamento|agendamentos)\b/.test(texto)

  const falaDeCancelamento =
    /\b(cancelar|cancela|cancelo|cancelamento|desmarcar|desmarca|desfazer|remover|apagar|deletar|desistir)\b/.test(texto)

  const falaDeAlteracao =
    /\b(alterar|altera|alteracao|mudar|trocar|editar|remarcar|reagendar)\b/.test(texto)

  const falaDeMinhasReservas =
    /\b(minha reserva|minhas reservas|ver reserva|ver minhas reservas|consultar reserva|historico de reservas)\b/.test(texto)

  const falaDePagamento =
    /\b(pagar|pagamento|pix|cartao|boleto|paguei|confirmar pagamento|comprovante)\b/.test(texto)

  const falaDeLogin =
    /\b(login|entrar|senha|cadastro|cadastrar|conta|acesso)\b/.test(texto)

  const falaDeAdmin =
    /\b(admin|administrador|painel admin|area admin|cadastrar carro|editar carro|remover carro)\b/.test(texto)

  return (
    (falaDeReserva && falaDeCancelamento) ||
    (falaDeReserva && falaDeAlteracao) ||
    falaDeMinhasReservas ||
    (falaDeReserva && falaDePagamento) ||
    falaDeLogin ||
    falaDeAdmin
  )
}

function pareceFluxoComCards(textoUsuario, intent) {
  const texto = normalizarTexto(textoUsuario)
  const intentNormalizada = normalizarTexto(intent)

  if (INTENTS_COM_CARDS.has(intentNormalizada)) {
    return true
  }

  return (
    /\b(reservar|alugar|locar)\b.*\b(carro|veiculo)\b/.test(texto) ||
    /\b(quero|preciso|buscar|ver|mostrar)\b.*\b(carro|carros|veiculo|veiculos|modelos)\b/.test(texto) ||
    /\b(carros disponiveis|quais carros|modelos disponiveis|ver carros)\b/.test(texto) ||
    /\b(suv|sedan|esportivo|luxo|economico|barato|automatico|manual)\b/.test(texto) ||
    /\b(recomenda|recomendar|indicacao|indicar)\b.*\b(carro|veiculo)\b/.test(texto)
  )
}

function obterCardsPermitidos(data, textoUsuario) {
  const cards = Array.isArray(data?.cards) ? data.cards.filter(Boolean) : []

  if (!cards.length) {
    return []
  }

  const intent = data?.intent || data?.intencao || ''

  // Nova solução ideal: backend manda showCards explicitamente.
  if (
    data?.showCards === false ||
    data?.mostrarCards === false ||
    data?.exibirCards === false
  ) {
    return []
  }

  // Camada de segurança do front: mesmo que o backend erre, bloqueia cards.
  if (pareceFluxoSemCards(textoUsuario, intent)) {
    return []
  }

  // Nova solução ideal: backend autoriza exibir cards.
  if (
    (data?.showCards === true ||
      data?.mostrarCards === true ||
      data?.exibirCards === true) &&
    INTENTS_COM_CARDS.has(normalizarTexto(intent))
  ) {
    return cards
  }

  // Compatibilidade com backend antigo: só mostra cards se a intenção parecer fluxo de carros.
  if (pareceFluxoComCards(textoUsuario, intent)) {
    return cards
  }

  return []
}

export default function Chatbot() {
  const [aberto, setAberto] = useState(false)
  const [mensagens, setMensagens] = useState([
    { de: 'bot', texto: 'Olá! Sou o assistente do AgendaCar. Como posso ajudar?' },
  ])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const fimRef = useRef(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function enviar(e) {
    e.preventDefault()
    if (!input.trim() || carregando) return

    const texto = input.trim()
    setInput('')
    setMensagens(prev => [...prev, { de: 'user', texto }])
    setCarregando(true)

    try {
      const { data } = await api.post('/chatbot', { mensagem: texto })

      const resposta =
        data?.resposta ||
        data?.text ||
        data?.message ||
        'Não consegui entender sua solicitação. Pode reformular?'

      const cardsPermitidos = obterCardsPermitidos(data, texto)

      setMensagens(prev => [
        ...prev,
        {
          de: 'bot',
          texto: resposta,
          cards: cardsPermitidos,
        },
      ])
    } catch {
      setMensagens(prev => [
        ...prev,
        {
          de: 'bot',
          texto: 'Erro de conexão. Tente novamente.',
          cards: [],
        },
      ])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.22, type: 'spring', stiffness: 400, damping: 28 }}
            className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            <div className="bg-brand-dark px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center">
                  <Bot size={16} className="text-brand-accent" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Assistente</p>
                  <p className="text-green-400 text-xs mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    Online
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAberto(false)}
                className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
              style={{ minHeight: '260px', maxHeight: '320px' }}
            >
              {mensagens.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.de === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.de === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-brand-deeper flex items-center justify-center mr-2 shrink-0 mt-0.5">
                      <Bot size={12} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] ${
                      msg.de === 'user' ? 'items-end' : 'items-start'
                    } flex flex-col gap-2`}
                  >
                    <span
                      className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.de === 'user'
                          ? 'bg-brand-blue text-white rounded-br-sm'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                      }`}
                    >
                      {msg.texto}
                    </span>

                    {msg.cards?.map(card => (
                      <div
                        key={card.id}
                        className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                      >
                        {card.imagem && (
                          <img
                            src={card.imagem}
                            alt=""
                            className="h-24 w-full object-contain bg-gray-100 p-2"
                            onError={e => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}

                        <div className="p-3 space-y-1">
                          <p className="font-semibold text-sm text-gray-900">
                            {card.nome}
                          </p>

                          <p className="text-xs text-gray-500">
                            {card.tipo} • {card.capacidade} lugares • {card.transmissao}
                          </p>

                          <p className="text-xs text-gray-700">
                            R$ {Number(card.precoDia).toLocaleString('pt-BR')} / dia
                          </p>

                          <Link
                            to={card.url}
                            onClick={() => setAberto(false)}
                            className="mt-2 inline-flex w-full justify-center rounded-xl bg-brand-blue px-3 py-2 text-xs font-semibold text-white hover:bg-brand-deeper transition-colors"
                          >
                            {card.acaoTexto || 'Reservar agora'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {carregando && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-brand-deeper flex items-center justify-center mr-2 shrink-0 mt-0.5">
                    <Bot size={12} className="text-white" />
                  </div>

                  <span className="px-3 py-2 rounded-2xl text-sm bg-white text-gray-500 shadow-sm border border-gray-100 rounded-bl-sm">
                    Digitando...
                  </span>
                </div>
              )}

              <div ref={fimRef} />
            </div>

            <form onSubmit={enviar} className="p-3 border-t border-gray-100 bg-white flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-blue transition-colors"
              />

              <button
                type="submit"
                disabled={carregando || !input.trim()}
                className="bg-brand-blue hover:bg-brand-deeper text-white p-2 rounded-xl transition-all duration-200 disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setAberto(prev => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="w-14 h-14 bg-brand-deeper hover:bg-brand-dark text-white rounded-full shadow-2xl flex items-center justify-center transition-colors duration-200 relative"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={aberto ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {aberto ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.span>
        </AnimatePresence>

        {!aberto && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </motion.button>
    </div>
  )
}
