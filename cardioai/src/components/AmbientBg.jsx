export default function AmbientBg() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      {/* Deep base */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% -20%, rgba(6,28,64,0.8) 0%, #030712 60%)" }} />

      {/* Cyan bloom */}
      <div className="animate-pulse-slow" style={{ position:"absolute", top:-200, left:-200, width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 65%)", filter:"blur(80px)" }} />

      {/* Violet bloom */}
      <div style={{ position:"absolute", top:-100, right:-100, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)", filter:"blur(90px)", animation:"pulse-slow 8s ease-in-out infinite 2s" }} />

      {/* Rose bottom */}
      <div style={{ position:"absolute", bottom:-100, left:"50%", transform:"translateX(-50%)", width:600, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)", filter:"blur(70px)" }} />

      {/* Grid */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)", backgroundSize:"48px 48px" }} />

      {/* ECG line */}
      <div style={{ position:"absolute", bottom:40, left:0, right:0, opacity:0.3 }}>
        <svg viewBox="0 0 400 60" style={{ width:"100%", height:60 }}>
          <path
            d="M0,30 L60,30 L75,10 L80,50 L85,15 L92,45 L97,30 L130,30 L145,8 L150,52 L155,12 L162,48 L167,30 L200,30 L215,10 L220,50 L225,15 L232,45 L237,30 L270,30 L285,8 L290,52 L295,12 L302,48 L307,30 L340,30 L355,10 L360,50 L365,15 L372,45 L377,30 L400,30"
            fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.5"
            strokeDasharray="400"
            style={{ animation:"ecgLine 2.5s linear infinite" }}
          />
        </svg>
      </div>

      {/* Rotating rings */}
      <div className="animate-spin-slow" style={{ position:"absolute", top:"50%", right:-120, transform:"translateY(-50%)", width:400, height:400, borderRadius:"50%", border:"1px solid rgba(34,211,238,0.07)" }} />
      <div style={{ position:"absolute", top:"50%", right:-80, transform:"translateY(-50%)", width:320, height:320, borderRadius:"50%", border:"1px solid rgba(99,102,241,0.05)" }} />
    </div>
  );
}
