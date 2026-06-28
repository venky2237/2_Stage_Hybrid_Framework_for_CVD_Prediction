export default function RiskGauge({ value, label }) {
  const pct        = Math.round(value * 100);
  const angle      = -135 + pct * 2.7;
  const color      = pct >= 60 ? "#f87171" : pct >= 40 ? "#fb923c" : "#34d399";
  const bgColor    = pct >= 60 ? "rgba(248,113,113,0.08)"  : pct >= 40 ? "rgba(251,146,60,0.08)"  : "rgba(52,211,153,0.08)";
  const borderColor= pct >= 60 ? "rgba(248,113,113,0.2)"   : pct >= 40 ? "rgba(251,146,60,0.2)"   : "rgba(52,211,153,0.2)";

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:24, background:bgColor, border:`1px solid ${borderColor}`, borderRadius:16 }}>
      <svg viewBox="0 0 200 120" style={{ width:180 }}>
        <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round"/>
        <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${pct * 2.51} 251`} style={{ transition:"stroke-dasharray 1s ease" }} />
        <g transform={`rotate(${angle}, 100, 110)`}>
          <line x1="100" y1="110" x2="100" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="100" cy="110" r="5" fill={color}/>
        </g>
        <text x="100" y="100" textAnchor="middle" fill={color} fontSize="26" fontWeight="700" fontFamily="Orbitron, monospace">
          {pct}%
        </text>
      </svg>
      <p style={{ color:"rgba(148,163,184,0.7)", fontSize:13, fontWeight:600, marginTop:4 }}>{label}</p>
    </div>
  );
}
