import { useNavigate } from 'react-router-dom'
import { Fuel, Settings2, Users, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CarCard({ carro, index = 0 }) {
  const navigate = useNavigate()

  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(carro.precoDia)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', transition: { duration: 0.2 } }}
      onClick={() => navigate(`/carros/${carro.id}`)}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header gradient com imagem */}
      <div style={{
        position: 'relative',
        height: 176,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 60% 50%, #1e4fad 0%, #0d2459 100%)',
      }}>
        <div style={{
          position: 'absolute', width: 160, height: 160, borderRadius: '50%',
          background: '#3b82f6', filter: 'blur(35px)', opacity: 0.25,
          top: -20, right: -20,
        }} />
        <div style={{
          position: 'absolute', width: 100, height: 100, borderRadius: '50%',
          background: '#60a5fa', filter: 'blur(25px)', opacity: 0.15,
          bottom: -10, left: 20,
        }} />

        <img
          src={carro.imagem}
          alt={carro.nome}
          style={{
            position: 'relative', zIndex: 10,
            height: 128, width: '100%',
            objectFit: 'contain', padding: '0 16px',
            filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.5))',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          onError={e => { e.target.src = '/img/carro.png' }}
        />

        <span style={{
          position: 'absolute', top: 12, right: 12,
          fontSize: '0.68rem', fontWeight: 700,
          padding: '4px 10px', borderRadius: 20,
          background: carro.disponivel
            ? 'linear-gradient(135deg, #059669, #10b981)'
            : 'linear-gradient(135deg, #dc2626, #ef4444)',
          color: '#fff',
          boxShadow: carro.disponivel
            ? '0 2px 8px rgba(16,185,129,0.4)'
            : '0 2px 8px rgba(239,68,68,0.4)',
          letterSpacing: '0.04em',
        }}>
          {carro.disponivel ? 'Disponível' : 'Indisponível'}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '1rem', fontWeight: 700,
            color: '#fff', lineHeight: 1.2, margin: 0,
          }}>
            {carro.nome}
          </h3>
          <p style={{
            fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.4)',
            marginTop: 3,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}>
            {carro.tipo}
          </p>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)',
          marginBottom: 16,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '8px 12px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Fuel size={13} style={{ color: '#60a5fa' }} />
            {carro.tanque}L
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Settings2 size={13} style={{ color: '#60a5fa' }} />
            {carro.transmissao}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={13} style={{ color: '#60a5fa' }} />
            {carro.capacidade}p
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            <p style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '1.15rem', fontWeight: 800,
              color: '#93c5fd', lineHeight: 1, margin: 0,
            }}>
              {priceFormatted}
            </p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>/dia</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/carros/${carro.id}`) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
              border: 'none', borderRadius: 12, color: '#fff',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700, fontSize: '0.72rem',
              letterSpacing: '0.05em',
              padding: '9px 16px', cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(59,130,246,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.35)' }}
          >
            Reservar
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
