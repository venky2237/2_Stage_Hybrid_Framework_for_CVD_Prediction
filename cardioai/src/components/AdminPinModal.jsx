import { useState } from "react";
import Icon from "./Icon";

export default function AdminPinModal({ onSuccess, onClose }) {
  const [pin,   setPin]   = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (digit) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);

    if (next.length === 4) {
      if (next === "1234") {
        setTimeout(onSuccess, 300);
      } else {
        setError(true); setShake(true);
        setTimeout(() => { setPin(""); setError(false); setShake(false); }, 800);
      }
    }
  };

  const KEYS = [1,2,3,4,5,6,7,8,9,"",0,"⌫"];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.8)", backdropFilter:"blur(10px)" }}>
      <div className="animate-fade" style={{ position:"relative", background:"linear-gradient(145deg,rgba(2,10,32,0.95),rgba(6,18,52,0.95))", border:"1px solid rgba(34,211,238,0.2)", borderRadius:20, padding:40, width:340, textAlign:"center", boxShadow:"0 0 60px rgba(34,211,238,0.15)" }}>

        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", cursor:"pointer", color:"rgba(148,163,184,0.4)" }}>
          <Icon name="x" size={18} />
        </button>

        <div style={{ width:56, height:56, borderRadius:16, background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <Icon name="shield" size={24} color="#22d3ee" />
        </div>

        <p className="orbitron" style={{ color:"#22d3ee", fontSize:14, letterSpacing:"0.15em", marginBottom:6 }}>ADMIN ACCESS</p>
        <p style={{ color:"rgba(148,163,184,0.6)", fontSize:13, marginBottom:28 }}>Enter your 4-digit PIN</p>

        {/* PIN dots */}
        <div className={shake ? "animate-glitch" : ""} style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:28 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width:16, height:16, borderRadius:"50%", transition:"all 0.15s",
              background:    pin.length > i ? (error ? "#f87171" : "#22d3ee") : "rgba(255,255,255,0.08)",
              border:`1px solid ${pin.length > i ? (error ? "rgba(248,113,113,0.5)" : "rgba(34,211,238,0.5)") : "rgba(255,255,255,0.12)"}`,
              boxShadow:     pin.length > i && !error ? "0 0 10px rgba(34,211,238,0.4)" : "none",
            }} />
          ))}
        </div>

        {/* Numpad */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
          {KEYS.map((d, i) => (
            <button
              key={i}
              onClick={() => d === "⌫" ? setPin(p => p.slice(0,-1)) : d !== "" && handleDigit(String(d))}
              style={{
                padding:"14px 0", borderRadius:10, fontSize:18,
                fontFamily:"Orbitron, monospace", color:"#e2e8f0",
                background: d === "" ? "transparent" : "rgba(255,255,255,0.04)",
                border:     d === "" ? "none"        : "1px solid rgba(255,255,255,0.07)",
                cursor:     d === "" ? "default"     : "pointer",
                transition:"all 0.15s",
              }}
              onMouseEnter={e => { if (d !== "") e.target.style.background = "rgba(34,211,238,0.08)"; }}
              onMouseLeave={e => { if (d !== "") e.target.style.background = "rgba(255,255,255,0.04)"; }}
            >
              {d}
            </button>
          ))}
        </div>

        <p className="mono" style={{ color:"rgba(148,163,184,0.3)", fontSize:11, marginTop:20 }}>Demo PIN: 1234</p>
      </div>
    </div>
  );
}
