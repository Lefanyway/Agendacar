import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const CHAR_KF = `
  @keyframes scratchArm {
    0%, 100% { transform: rotate(-18deg); }
    50%       { transform: rotate(14deg); }
  }
  @keyframes sweatDrop {
    0%   { opacity:0; transform:translateY(0); }
    15%  { opacity:0.9; }
    100% { opacity:0; transform:translateY(22px); }
  }
  @keyframes bodyWobble {
    0%, 100% { transform: rotate(0deg); }
    25%       { transform: rotate(1.5deg); }
    75%       { transform: rotate(-1.5deg); }
  }
  @keyframes qFloat {
    0%, 100% { transform: translateY(0) rotate(-6deg); }
    50%       { transform: translateY(-14px) rotate(6deg); }
  }
  @keyframes qFloat2 {
    0%, 100% { transform: translateY(0) rotate(4deg); }
    50%       { transform: translateY(-10px) rotate(-4deg); }
  }
  @keyframes starTwinkle {
    0%, 100% { opacity:0.15; transform:scale(0.7); }
    50%       { opacity:0.7;  transform:scale(1.2); }
  }
`

function ConfusedPerson() {
  return (
    <div style={{ position:'relative', display:'inline-block', padding:'10px 50px 0 20px' }}>
      <style>{CHAR_KF}</style>

      {/* Floating question marks */}
      <div style={{
        position:'absolute', top:-16, right:10,
        fontSize:52, fontWeight:900, color:'#60a5fa', fontFamily:'Georgia,serif',
        lineHeight:1, userSelect:'none',
        animation:'qFloat 2.3s ease-in-out infinite',
        textShadow:'0 4px 24px rgba(96,165,250,0.4)',
      }}>?</div>
      <div style={{
        position:'absolute', top:24, right:-14,
        fontSize:30, fontWeight:900, color:'#93c5fd', fontFamily:'Georgia,serif',
        lineHeight:1, userSelect:'none', opacity:0.7,
        animation:'qFloat2 3s ease-in-out infinite',
      }}>?</div>

      <svg viewBox="0 0 100 210" width="160" style={{ display:'block', overflow:'visible' }}>
        {/* Shadow */}
        <motion.ellipse cx="50" cy="205" rx="26" ry="5" fill="rgba(13,36,89,0.3)"
          animate={{ rx:[26,21,26], opacity:[0.3,0.18,0.3] }}
          transition={{ duration:2.2, repeat:Infinity, ease:'easeInOut' }} />

        {/* Body group wobble */}
        <g style={{ transformOrigin:'50px 130px', animation:'bodyWobble 2s ease-in-out infinite' }}>

          {/* Legs */}
          <path d="M44,155 Q42,170 40,188" stroke="#1e3a5f" strokeWidth="7.5" fill="none" strokeLinecap="round"/>
          <path d="M56,155 Q58,170 60,188" stroke="#1e3a5f" strokeWidth="7.5" fill="none" strokeLinecap="round"/>
          {/* Feet */}
          <path d="M36,188 Q40,192 47,189" stroke="#1e3a5f" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <path d="M56,189 Q62,192 67,188" stroke="#1e3a5f" strokeWidth="5" fill="none" strokeLinecap="round"/>

          {/* Body */}
          <path d="M30,102 Q28,132 30,155 L70,155 Q72,132 70,102 Z" fill="#3b82f6"/>
          {/* Shirt detail */}
          <path d="M44,102 L50,113 L56,102" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          {/* Belt */}
          <rect x="30" y="143" width="40" height="5" rx="2" fill="#1e3a8a" opacity="0.6"/>

          {/* Left arm — gentle sway */}
          <motion.path
            d="M30,112 Q18,132 16,146"
            stroke="#f4c28a" strokeWidth="7" fill="none" strokeLinecap="round"
            animate={{ d:['M30,112 Q18,132 16,146','M30,112 Q16,130 14,145','M30,112 Q18,132 16,146'] }}
            transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }} />

          {/* Right arm — scratching head */}
          <g style={{ transformOrigin:'70px 112px', animation:'scratchArm 0.38s ease-in-out infinite' }}>
            <path d="M70,112 Q80,93 75,73" stroke="#f4c28a" strokeWidth="7" fill="none" strokeLinecap="round"/>
            {/* Hand at head */}
            <circle cx="75" cy="71" r="5" fill="#f4c28a"/>
          </g>

          {/* Neck */}
          <rect x="44" y="88" width="12" height="16" rx="5" fill="#f4c28a"/>

          {/* Head */}
          <circle cx="50" cy="70" r="26" fill="#f4c28a"/>

          {/* Hair */}
          <path d="M24,64 Q27,40 50,38 Q73,40 76,64 Q70,48 50,46 Q30,48 24,64 Z" fill="#5c3d1e"/>

          {/* Eyes — blink periodically */}
          <motion.g
            style={{ transformOrigin:'50px 68px' }}
            animate={{ scaleY:[1,1,1,1,1,1,0.07,1,1,1,1,1,1,1,0.07,1] }}
            transition={{ duration:5, repeat:Infinity, times:[0,0.08,0.16,0.24,0.32,0.38,0.4,0.42,0.5,0.58,0.66,0.72,0.78,0.84,0.86,1] }}
          >
            <circle cx="41" cy="68" r="4" fill="#2d1a0a"/>
            <circle cx="59" cy="68" r="4" fill="#2d1a0a"/>
            <circle cx="42.5" cy="66.5" r="1.4" fill="white"/>
            <circle cx="60.5" cy="66.5" r="1.4" fill="white"/>
          </motion.g>

          {/* Raised confused eyebrows */}
          <motion.g
            animate={{ y:[-0.5,0.5,-0.5] }}
            transition={{ duration:1.8, repeat:Infinity, ease:'easeInOut' }}
          >
            <path d="M36,59 Q40,54 45,57" stroke="#5c3d1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M55,57 Q60,54 64,59" stroke="#5c3d1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </motion.g>

          {/* Confused mouth */}
          <motion.path
            d="M42,80 Q46,76 50,78 Q54,81 58,77"
            stroke="#c08060" strokeWidth="2.5" fill="none" strokeLinecap="round"
            animate={{ d:['M42,80 Q46,76 50,78 Q54,81 58,77','M42,81 Q46,77 50,79 Q54,82 58,78','M42,80 Q46,76 50,78 Q54,81 58,77'] }}
            transition={{ duration:2.2, repeat:Infinity, ease:'easeInOut' }} />

          {/* Sweat drops */}
          <g style={{ animation:'sweatDrop 3.2s 1.2s infinite' }}>
            <path d="M77,62 Q80,57 77,68" stroke="#60a5fa" strokeWidth="2.2" fill="rgba(96,165,250,0.45)" strokeLinecap="round"/>
          </g>
          <g style={{ animation:'sweatDrop 3.2s 3.8s infinite' }}>
            <path d="M80,70 Q83,65 80,76" stroke="#93c5fd" strokeWidth="1.8" fill="rgba(147,197,253,0.4)" strokeLinecap="round"/>
          </g>

        </g>
      </svg>
    </div>
  )
}

export default function EsqueceuSenha() {
  const [email, setEmail]     = useState('')
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Lado esquerdo: personagem animado ── */}
      <div className="hidden lg:flex w-[52%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ backgroundColor: '#0d2459' }}>

        {/* Fundo estrelado sutil */}
        <style>{`
          @keyframes bgStar { 0%,100%{opacity:.1;transform:scale(.7)} 50%{opacity:.6;transform:scale(1.2)} }
        `}</style>
        {Array.from({length:30},(_,i) => (
          <div key={i} style={{
            position:'absolute',
            left:`${(i*137.508)%100}%`,
            top:`${(i*97.31)%90}%`,
            width: i%7===0?3:i%3===0?2:1.5,
            height: i%7===0?3:i%3===0?2:1.5,
            borderRadius:'50%', background:'white',
            animation:`bgStar ${2.5+(i*.12)%2.5}s ${(i*.22)%5}s ease-in-out infinite alternate`,
          }}/>
        ))}

        {/* Glow behind character */}
        <div style={{
          position:'absolute',
          width:320, height:320, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
          filter:'blur(40px)',
        }} />

        {/* Gradient ring */}
        <div className="absolute w-[550px] h-[550px] rounded-full border border-white/[0.04] animate-spin-slow pointer-events-none" />

        {/* Character */}
        <motion.div
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.9 }}
          className="relative z-10"
        >
          <ConfusedPerson />
        </motion.div>

        {/* Caption */}
        <motion.p
          className="relative z-10 text-white/50 text-sm font-light tracking-widest uppercase mt-6"
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:0.6 }}
        >
          Acontece com todo mundo
        </motion.p>
      </div>

      {/* ── Lado direito ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <motion.div className="w-full max-w-md"
          initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>

          <Link to="/login" className="flex items-center gap-1.5 text-gray-400 hover:text-brand-blue text-sm mb-8 transition-colors">
            <ArrowLeft size={15} />
            Voltar ao login
          </Link>

          {enviado ? (
            <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="text-center py-6">
              <CheckCircle size={56} className="mx-auto mb-4" style={{ color:'#0d2459' }} />
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Email enviado!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Se o email <strong>{email}</strong> estiver cadastrado, você receberá as instruções em instantes.
              </p>
              <Link to="/login"
                className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-[1.02]"
                style={{ backgroundColor:'#0d2459' }}>
                Voltar ao login
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Esqueceu a senha?</h1>
              <p className="text-gray-400 text-sm mb-8">Digite seu email e enviaremos as instruções de recuperação.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com" required
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all bg-gray-50 focus:bg-white" />
                  </div>
                </div>
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  style={{ backgroundColor:'#0d2459' }}>
                  <Mail size={16} />
                  Enviar instruções
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
