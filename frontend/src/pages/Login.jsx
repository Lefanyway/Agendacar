import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import AnimatedScene from '../components/AnimatedScene'

const PAGE_KF = `
  @keyframes pageFade { from { opacity:0; } to { opacity:1; } }
`

export default function Login() {
  const [email, setEmail]         = useState('')
  const [senha, setSenha]         = useState('')
  const [senhaVisivel, setSenha2] = useState(false)
  const [erro, setErro]           = useState('')
  const [carregando, setLoad]     = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoad(true)
    try {
      const { data } = await api.post('/auth/login', { email, senha })
      login(data.token, { nome: data.nome, email, role: data.role })
      navigate('/home')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Credenciais inválidas.')
    } finally {
      setLoad(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      animation: 'pageFade 0.8s ease-out',
    }}>
      <style>{PAGE_KF}</style>

      {/* ── Cena animada: fundo completo ── */}
      <AnimatedScene />

      {/* Overlay escuro sutil para profundidade */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'rgba(0,0,0,0.22)',
      }} />

      {/* ── Conteúdo centralizado ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 420,
          padding: '0 20px',
        }}
      >
        {/* ── Logo como texto — sem PNG, funde com o fundo ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: '2.6rem',
            fontWeight: 900,
            letterSpacing: '0.28em',
            color: '#ffffff',
            margin: 0,
            lineHeight: 1,
            textShadow: '0 2px 20px rgba(0,0,50,0.6)',
          }}>
            AGENDA<span style={{ color: '#60a5fa' }}>CAR</span>
          </h1>

          {/* Linha decorativa */}
          <div style={{
            margin: '10px auto 0',
            height: 2, width: 56, borderRadius: 2,
            background: 'linear-gradient(to right, #3b82f6, #93c5fd)',
            opacity: 0.7,
          }} />

          <p style={{
            fontFamily: '"Montserrat", sans-serif',
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.68rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            marginTop: 10,
            fontWeight: 300,
          }}>
            Agende &nbsp;·&nbsp; Dirija &nbsp;·&nbsp; Explore
          </p>
        </div>

        {/* ── Card glassmorphism ── */}
        <div style={{
          background: 'rgba(4,12,40,0.58)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '36px 32px 32px',
          boxShadow: '0 32px 64px rgba(0,0,40,0.5), 0 0 0 1px rgba(59,130,246,0.12)',
        }}>
          <h2 style={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#ffffff',
            fontSize: '1.15rem',
            fontWeight: 700,
            margin: '0 0 4px',
          }}>
            Bem-vindo de volta
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', margin: '0 0 28px' }}>
            Faça login para continuar
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display:'block', color:'rgba(255,255,255,0.5)', fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8, fontWeight:600 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.25)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  padding: '8px 0',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderBottomColor = '#60a5fa'}
                onBlur={e  => e.target.style.borderBottomColor = 'rgba(255,255,255,0.25)'}
              />
            </div>

            {/* Senha */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:600 }}>
                  Senha
                </label>
                <Link to="/esqueceu-senha" style={{ color:'#60a5fa', fontSize:'0.72rem', textDecoration:'none', opacity:0.85 }}>
                  Esqueceu a senha?
                </Link>
              </div>
              <div style={{ position:'relative' }}>
                <input
                  type={senhaVisivel ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    padding: '8px 32px 8px 0',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderBottomColor = '#60a5fa'}
                  onBlur={e  => e.target.style.borderBottomColor = 'rgba(255,255,255,0.25)'}
                />
                <button
                  type="button"
                  onClick={() => setSenha2(v => !v)}
                  style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', padding:0 }}
                >
                  {senhaVisivel ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <motion.p
                initial={{ opacity:0, y:-6 }}
                animate={{ opacity:1, y:0 }}
                style={{
                  color:'#fca5a5',
                  background:'rgba(239,68,68,0.15)',
                  border:'1px solid rgba(239,68,68,0.3)',
                  borderRadius:10,
                  padding:'10px 14px',
                  fontSize:'0.8rem',
                  margin:0,
                }}
              >
                {erro}
              </motion.p>
            )}

            {/* Botão */}
            <motion.button
              type="submit"
              disabled={carregando}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(59,130,246,0.45)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                border: 'none',
                borderRadius: 12,
                color: '#ffffff',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                fontSize: '0.82rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '14px',
                cursor: carregando ? 'not-allowed' : 'pointer',
                opacity: carregando ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
                transition: 'background 0.3s',
              }}
            >
              {carregando
                ? <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                : <LogIn size={15} />}
              {carregando ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>

          <p style={{ textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:'0.8rem', marginTop:22, marginBottom:0 }}>
            Não tem conta?{' '}
            <Link to="/cadastro" style={{ color:'#93c5fd', fontWeight:600, textDecoration:'none' }}>
              Criar conta grátis
            </Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(4,12,40,0.01) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
      `}</style>
    </div>
  )
}
