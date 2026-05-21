import { motion } from 'framer-motion'

export default function Banner({ variant = 'blue', title, subtitle, imgSrc, imgAlt }) {
  const isBlue = variant === 'blue'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative rounded-3xl overflow-hidden flex items-center min-h-[220px] md:min-h-[260px]"
      style={{
        background: isBlue
          ? 'radial-gradient(circle at 60% 50%, #3a83f9 0%, #0056e0 100%)'
          : 'linear-gradient(135deg, #0b1c66 0%, #0e2766 100%)',
      }}
    >
      {/* Animated background blobs */}
      <div
        className="absolute w-72 h-72 rounded-full opacity-20 animate-blob"
        style={{
          background: isBlue ? '#60a5fa' : '#3b82f6',
          top: '-60px',
          left: '-60px',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute w-56 h-56 rounded-full opacity-15 animate-blob"
        style={{
          background: isBlue ? '#93c5fd' : '#1d4ed8',
          bottom: '-40px',
          right: '30%',
          filter: 'blur(30px)',
          animationDelay: '2s',
        }}
      />

      {/* Texto */}
      <div className="relative z-10 p-7 md:p-10 w-[52%]">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-3 drop-shadow">
          {title}
        </h1>
        <p className="text-white/75 text-xs md:text-sm leading-relaxed hidden sm:block">
          {subtitle}
        </p>
      </div>

      {/* Imagem do carro — grande, colada à borda direita/inferior */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="absolute right-0 bottom-0 w-[55%] h-full flex items-end justify-end pointer-events-none"
      >
        <img
          src={imgSrc}
          alt={imgAlt}
          className="w-full h-full object-contain object-right-bottom"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }}
          onError={e => { e.target.src = '/img/carro.png' }}
        />
      </motion.div>

      {/* Fade lateral esquerdo para suavizar transição */}
      <div
        className="absolute inset-y-0 left-0 w-24 pointer-events-none"
        style={{
          background: isBlue
            ? 'linear-gradient(to right, #0056e0 0%, transparent 100%)'
            : 'linear-gradient(to right, #0b1c66 0%, transparent 100%)',
          opacity: 0.5,
        }}
      />
    </motion.div>
  )
}
