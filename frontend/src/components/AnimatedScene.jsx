import { useMemo } from 'react'

const KEYFRAMES = `
  @keyframes twinkle {
    0%   { opacity: 0.15; transform: scale(0.75); }
    100% { opacity: 0.95; transform: scale(1.25); }
  }
  @keyframes moonPulse {
    0%,100% { box-shadow: 0 0 30px 12px rgba(200,220,255,0.15), 0 0 70px 30px rgba(140,180,255,0.07); }
    50%     { box-shadow: 0 0 50px 20px rgba(200,220,255,0.25), 0 0 100px 50px rgba(140,180,255,0.11); }
  }
  @keyframes waveScroll1 {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes waveScroll2 {
    0%   { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  @keyframes waveScroll3 {
    0%   { transform: translateX(-25%); }
    100% { transform: translateX(-75%); }
  }
  @keyframes shimmer {
    0%,100% { opacity: 0.2; transform: translateX(-50%) scaleX(0.7); }
    50%     { opacity: 0.45; transform: translateX(-50%) scaleX(1.05); }
  }
  @keyframes shootingStar {
    0%   { opacity: 0;   transform: translate(0,0)        scaleX(0); }
    10%  { opacity: 1;   transform: translate(0,0)        scaleX(1); }
    80%  { opacity: 0.6; transform: translate(180px,70px) scaleX(1); }
    100% { opacity: 0;   transform: translate(220px,85px) scaleX(0); }
  }
  @keyframes fogDrift {
    0%   { transform: translateX(-5%) scaleY(1);   opacity: 0.06; }
    50%  { transform: translateX(5%)  scaleY(1.08); opacity: 0.1; }
    100% { transform: translateX(-5%) scaleY(1);   opacity: 0.06; }
  }
  @keyframes glowPulse {
    0%,100% { opacity: 0.7; }
    50%     { opacity: 1; }
  }
`

const W1 = 'M0,55 C120,15 240,95 360,55 C480,15 600,95 720,55 C840,15 960,95 1080,55 C1200,15 1320,95 1440,55 L1440,110 L0,110 Z'
const W2 = 'M0,65 C160,25 320,105 480,65 C640,25 800,105 960,65 C1120,25 1280,105 1440,65 L1440,110 L0,110 Z'
const W3 = 'M0,75 C100,45 200,105 300,75 C400,45 500,105 600,75 C700,45 800,105 900,75 C1000,45 1100,105 1200,75 C1300,45 1400,95 1440,75 L1440,110 L0,110 Z'

function WaveLayer({ path, fill, speed, dir, bottom }) {
  const anim = dir === 'rtl' ? 'waveScroll2' : dir === 'alt' ? 'waveScroll3' : 'waveScroll1'
  return (
    <div style={{
      position: 'absolute', bottom, left: 0,
      width: '200%', overflow: 'hidden',
      animation: `${anim} ${speed}s linear infinite`,
    }}>
      {[0,1].map(i => (
        <svg key={i} viewBox="0 0 1440 110"
          style={{ display: 'block', width: '50%', float: 'left' }}
          preserveAspectRatio="none">
          <path d={path} fill={fill} />
        </svg>
      ))}
    </div>
  )
}

export default function AnimatedScene() {
  /* 35 estrelas, distribuição golden-angle */
  const stars = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: ((i * 137.508) % 100),
      y: ((i * 97.31)  % 65),
      size: i % 8 === 0 ? 3 : i % 3 === 0 ? 2 : 1.3,
      delay: (i * 0.27) % 5,
      dur:   2.8 + (i * 0.15) % 2.5,
    }))
  , [])

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none"
      style={{ background: 'linear-gradient(180deg, #050a1f 0%, #0a1438 40%, #0d2459 72%, #112a5e 100%)' }}>
      <style>{KEYFRAMES}</style>

      {/* Radial sky depth */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 75% at 65% 0%, #1a3a78 0%, transparent 60%)',
      }} />

      {/* Stars — max 35, twinkle suave */}
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          borderRadius: '50%',
          background: s.size >= 3 ? 'radial-gradient(circle, #fff, #cce0ff)' : '#fff',
          animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite alternate`,
        }} />
      ))}

      {/* Shooting stars */}
      <div style={{
        position: 'absolute', top: '7%', left: '12%',
        width: '90px', height: '1.5px',
        background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.85))',
        borderRadius: '2px', transformOrigin: 'left center',
        animation: 'shootingStar 11s 3s ease-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '20%', left: '62%',
        width: '65px', height: '1.2px',
        background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.65))',
        borderRadius: '2px', transformOrigin: 'left center',
        animation: 'shootingStar 11s 8.5s ease-out infinite',
      }} />

      {/* Moon */}
      <div style={{
        position: 'absolute', top: '8%', right: '13%',
        width: '70px', height: '70px', borderRadius: '50%',
        background: 'radial-gradient(circle at 36% 36%, #ffffff, #d8ecff)',
        boxShadow: '0 0 60px 20px rgba(255,255,255,0.15)',
        animation: 'moonPulse 5.5s ease-in-out infinite',
      }}>
        <div style={{ position:'absolute', top:'20%', left:'26%', width:'14px', height:'14px', borderRadius:'50%', background:'rgba(0,20,80,0.07)' }} />
        <div style={{ position:'absolute', top:'55%', left:'60%', width:'8px',  height:'8px',  borderRadius:'50%', background:'rgba(0,20,80,0.05)' }} />
      </div>

      {/* Nebula wisps */}
      {[
        { top:'15%', left:'4%',  w:'35%', h:'12%', delay:'0s' },
        { top:'28%', left:'52%', w:'30%', h:'10%', delay:'3s' },
      ].map((n,i) => (
        <div key={i} style={{
          position:'absolute', top:n.top, left:n.left,
          width:n.w, height:n.h,
          background:'radial-gradient(ellipse, rgba(80,140,255,0.07), transparent 70%)',
          filter:'blur(20px)',
          animation:`fogDrift 9s ${n.delay} ease-in-out infinite`,
        }} />
      ))}

      {/* Horizon atmospheric glow */}
      <div style={{
        position:'absolute', bottom:'26%', left:0, right:0, height:'16%',
        background:'linear-gradient(to top, rgba(17,42,94,0.6), transparent)',
        filter:'blur(3px)',
      }} />

      {/* Sea */}
      <div style={{
        position:'absolute', bottom:'14%', left:0, right:0, height:'18%',
        background:'linear-gradient(to bottom, #0a1e52 0%, #060e30 100%)',
      }} />

      {/* Moonlight shimmer on sea */}
      <div style={{
        position:'absolute', bottom:'15%', left:'62%',
        width:'80px', height:'140px',
        background:'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
        borderRadius:'50%', filter:'blur(12px)',
        animation:'shimmer 4s ease-in-out infinite',
        transform:'translateX(-50%)',
      }} />

      {/* Waves */}
      <WaveLayer path={W3} fill="rgba(10,30,90,0.88)"    speed={15} dir="alt" bottom="26%" />
      <WaveLayer path={W2} fill="rgba(13,40,110,0.90)"   speed={11} dir="rtl" bottom="21%" />
      <WaveLayer path={W1} fill="rgba(18,50,130,0.93)"   speed={7}  dir="ltr" bottom="16%" />
      <WaveLayer path={W1} fill="rgba(110,160,255,0.10)" speed={6}  dir="rtl" bottom="16%" />

      {/* Coastal land */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'18%',
        background:'linear-gradient(to top, #020609 0%, #060e22 100%)',
      }} />

      {/* Road */}
      <svg style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'18%' }}
        viewBox="0 0 400 100" preserveAspectRatio="none">
        <polygon points="148,0 252,0 400,100 0,100" fill="#07101f" />
        <line x1="200" y1="4"  x2="200" y2="18"  stroke="rgba(255,255,160,0.4)"  strokeWidth="2.5" />
        <line x1="200" y1="24" x2="199" y2="44"  stroke="rgba(255,255,160,0.3)"  strokeWidth="3.5" />
        <line x1="199" y1="52" x2="197" y2="78"  stroke="rgba(255,255,160,0.22)" strokeWidth="5"   />
        <line x1="148" y1="0" x2="0"   y2="100"  stroke="rgba(255,255,255,0.09)" strokeWidth="1"   />
        <line x1="252" y1="0" x2="400" y2="100"  stroke="rgba(255,255,255,0.09)" strokeWidth="1"   />
        <line x1="130" y1="0" x2="-20"  y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
        <line x1="270" y1="0" x2="420"  y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
      </svg>

      {/* ── Porsche 911 — fixo, sempre visível ── */}

      {/* Ground glow — único elemento com animação sutil */}
      <div style={{
        position: 'absolute',
        bottom: '12.5%',
        right: '4%',
        width: 320,
        height: 55,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,235,140,0.38) 0%, rgba(255,200,80,0.12) 50%, transparent 75%)',
        filter: 'blur(14px)',
        animation: 'glowPulse 4.5s ease-in-out infinite',
      }} />

      {/* Car image — sem animação, opacidade 1, sempre visível */}
      <div style={{
        position: 'absolute',
        bottom: '14%',
        right: '3%',
      }}>
        <img
          src="/img/porsche.png"
          alt=""
          style={{
            width: 290,
            display: 'block',
            opacity: 1,
            filter: [
              'brightness(0.78)',
              'contrast(1.08)',
              'drop-shadow(0 10px 28px rgba(0,0,0,0.95))',
              'drop-shadow(0 0 22px rgba(255,220,100,0.22))',
            ].join(' '),
          }}
        />
      </div>

      {/* Bottom fade to blend with content */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'7%',
        background:'linear-gradient(to top, rgba(5,10,31,0.5), transparent)',
      }} />
    </div>
  )
}
