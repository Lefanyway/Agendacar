import { useMemo } from 'react'

const BG_KF = `
  @keyframes orb1 {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(40px,-50px) scale(1.08); }
    66%      { transform:translate(-30px,30px)  scale(0.94); }
  }
  @keyframes orb2 {
    0%,100% { transform:translate(0,0) scale(1); }
    40%     { transform:translate(-50px,40px) scale(1.1); }
    80%     { transform:translate(30px,-25px) scale(0.92); }
  }
  @keyframes orb3 {
    0%,100% { transform:translate(0,0) scale(1); }
    50%     { transform:translate(25px,35px) scale(1.06); }
  }
  @keyframes particleRise {
    0%   { transform:translateY(0) scale(0.3);   opacity:0; }
    12%  { opacity:0.55; }
    88%  { opacity:0.3; }
    100% { transform:translateY(-95vh) scale(1); opacity:0; }
  }
`

export default function SubtleBackground() {
  const particles = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: (i * 137.508) % 100,
      size: 2.5 + (i * 1.4) % 3.5,
      delay: (i * 0.9) % 16,
      dur: 16 + (i * 1.2) % 10,
      color: i % 3 === 0 ? '#a5b4fc' : i % 3 === 1 ? '#7dd3fc' : '#93c5fd',
    }))
  , [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <style>{BG_KF}</style>

      {/* Base gradient — clearly visible soft blue-indigo sky */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #dbeafe 0%, #e0e7ff 30%, #ede9fe 58%, #dbeafe 100%)',
      }} />

      {/* Large animated orbs */}
      <div style={{
        position:'absolute', width:900, height:800,
        top:'-20%', left:'-15%',
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(147,197,253,0.55) 0%, transparent 65%)',
        filter:'blur(80px)',
        animation:'orb1 24s ease-in-out infinite',
      }} />
      <div style={{
        position:'absolute', width:750, height:700,
        top:'30%', right:'-18%',
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(167,139,250,0.45) 0%, transparent 65%)',
        filter:'blur(90px)',
        animation:'orb2 28s ease-in-out infinite',
      }} />
      <div style={{
        position:'absolute', width:600, height:550,
        bottom:'-10%', left:'20%',
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(125,211,252,0.5) 0%, transparent 65%)',
        filter:'blur(70px)',
        animation:'orb3 20s ease-in-out infinite',
      }} />
      <div style={{
        position:'absolute', width:400, height:400,
        top:'10%', left:'40%',
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(196,181,253,0.4) 0%, transparent 65%)',
        filter:'blur(60px)',
        animation:'orb1 18s 4s ease-in-out infinite',
      }} />

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', bottom:'-4px', left:`${p.x}%`,
          width:p.size, height:p.size,
          borderRadius:'50%',
          background:p.color,
          opacity:0.6,
          animation:`particleRise ${p.dur}s ${p.delay}s linear infinite`,
        }} />
      ))}

      {/* Subtle vignette top */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:'30%',
        background:'linear-gradient(to bottom, rgba(219,234,254,0.3), transparent)',
        pointerEvents:'none',
      }} />
    </div>
  )
}
