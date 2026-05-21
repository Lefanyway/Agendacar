import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
import CarCard from '../components/CarCard'
import Chatbot from '../components/Chatbot'
import api from '../services/api'

const DARK_BG = 'linear-gradient(180deg, #050a1f 0%, #0a1438 50%, #0f1d4a 100%)'

export default function Home() {
  const [carros, setCarros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    api.get('/carros')
      .then(({ data }) => setCarros(data))
      .finally(() => setCarregando(false))
  }, [])

  const carrosFiltrados = carros.filter(c =>
    c.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    c.tipo.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: DARK_BG }}>
      <Navbar />

      {/* Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Banner
          variant="blue"
          title="O melhor com o melhor, AgendaCar"
          subtitle="Alugue carros premium com o melhor preço do mercado. Simples, rápido e seguro."
          imgSrc="/img/porsche.png"
          imgAlt="Porsche 911"
        />
        <Banner
          variant="dark"
          title="AgendaCar, melhores preços"
          subtitle="Sport, SUV ou Picape. Temos o modelo ideal para cada aventura."
          imgSrc="/img/comprar-sense-200-tsi-automatica_5b696e8da4.png"
          imgAlt="T-Cross"
        />
      </section>

      {/* Carros */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '1.5rem', fontWeight: 800,
              color: '#ffffff', margin: 0,
            }}>
              Carros populares
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: 4 }}>
              {carros.length} modelos disponíveis
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ position: 'relative' }}
          >
            <Search size={16} style={{
              position: 'absolute', left: 12,
              top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.35)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Buscar modelo ou tipo..."
              style={{
                paddingLeft: 36, paddingRight: 16,
                paddingTop: 10, paddingBottom: 10,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%',
                minWidth: 240,
                transition: 'border-color 0.2s',
                backdropFilter: 'blur(8px)',
              }}
              onFocus={e => { e.target.style.borderColor = '#3b82f6' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
            />
          </motion.div>
        </div>

        {carregando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 20, height: 340,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : carrosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 64, height: 64,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Search size={24} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
              Nenhum carro encontrado para "{filtro}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {carrosFiltrados.map((carro, i) => (
              <CarCard key={carro.id} carro={carro} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
        marginTop: 24,
      }}>
        <div className="max-w-7xl mx-auto" style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <span style={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 900, fontSize: '1rem',
            letterSpacing: '0.2em', color: '#fff',
          }}>
            AGENDA<span style={{ color: '#60a5fa' }}>CAR</span>
          </span>

          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.78rem', margin: 0 }}>
            © {new Date().getFullYear()} AgendaCar · Todos os direitos reservados
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            {['GitHub', 'Instagram', 'Contato'].map((label) => (
              <span key={label} style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#93c5fd' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </footer>

      <Chatbot />

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.22); }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
