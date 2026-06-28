import { useState } from "react";
import Icon from "./Icon";

const PUBLIC_LINKS = [
  { id: "predict",   icon: "heart",     label: "Risk Predictor" },
];
const ADMIN_LINKS = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "patients",  icon: "users",     label: "Patient Records" },
];

export default function Sidebar({ page, setPage, isAdmin, onAdminClick }) {
  const [logoHover, setLogoHover] = useState(false);

  const NavBtn = ({ id, icon, label }) => (
    <button
      onClick={() => setPage(id)}
      style={{
        display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
        borderRadius:10, width:"100%", textAlign:"left", cursor:"pointer",
        border:   page === id ? "1px solid rgba(34,211,238,0.25)" : "1px solid transparent",
        background: page === id ? "rgba(34,211,238,0.08)" : "transparent",
        color:    page === id ? "#22d3ee" : "rgba(148,163,184,0.7)",
        fontSize:14, fontWeight:500, transition:"all 0.2s",
      }}
    >
      <Icon name={icon} size={15} color={page === id ? "#22d3ee" : "rgba(148,163,184,0.5)"} />
      {label}
    </button>
  );

  return (
    <aside style={{
      width:240, flexShrink:0, height:"100vh", position:"sticky", top:0,
      background:"rgba(2,8,24,0.85)", backdropFilter:"blur(20px)",
      borderRight:"1px solid rgba(34,211,238,0.08)",
      display:"flex", flexDirection:"column", zIndex:50,
    }}>

      {/* Logo */}
      <div
        style={{ padding:"24px 20px", borderBottom:"1px solid rgba(34,211,238,0.07)", cursor:"pointer", position:"relative" }}
        onMouseEnter={() => setLogoHover(true)}
        onMouseLeave={() => setTimeout(() => setLogoHover(false), 5000)}
      >
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div className="animate-heartbeat" style={{ width:40, height:40, borderRadius:12, background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="heart" size={18} color="#22d3ee" />
          </div>
          <div>
            <p className="orbitron" style={{ color:"#fff", fontSize:13, fontWeight:700, letterSpacing:"0.05em" }}>CardioAI</p>
            <p className="mono"     style={{ color:"rgba(148,163,184,0.45)", fontSize:11 }}>Diagnostic System</p>
          </div>
        </div>

        {/* Hidden admin trigger — appears on logo hover */}
        {logoHover && !isAdmin && (
          <div
            onClick={onAdminClick}
            className="animate-fade"
            style={{
              position:"absolute", bottom:-34, left:16, right:16,
              background:"rgba(34,211,238,0.08)", border:"1px solid rgba(34,211,238,0.2)",
              borderRadius:8, padding:"7px 12px",
              display:"flex", alignItems:"center", gap:6, cursor:"pointer", zIndex:60,
            }}
          >
            <Icon name="shield" size={11} color="#22d3ee" />
            <span className="mono" style={{ color:"#22d3ee", fontSize:10, letterSpacing:"0.08em" }}>Admin Access</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, padding:"20px 12px", display:"flex", flexDirection:"column", gap:4 }}>
        <p className="mono" style={{ color:"rgba(148,163,184,0.25)", fontSize:9, letterSpacing:"0.15em", padding:"0 12px", marginBottom:6 }}>PATIENT PORTAL</p>
        {PUBLIC_LINKS.map(l => <NavBtn key={l.id} {...l} />)}

        {isAdmin && (
          <>
            <div style={{ height:1, background:"rgba(255,255,255,0.04)", margin:"12px 0" }} />
            <p className="mono" style={{ color:"rgba(34,211,238,0.3)", fontSize:9, letterSpacing:"0.15em", padding:"0 12px", marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
              <Icon name="shield" size={9} color="rgba(34,211,238,0.4)" /> ADMIN
            </p>
            {ADMIN_LINKS.map(l => <NavBtn key={l.id} {...l} />)}
          </>
        )}
      </nav>

      <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <p className="mono" style={{ color:"rgba(148,163,184,0.2)", fontSize:11 }}>v1.0.0 · AI-Powered</p>
      </div>
    </aside>
  );
}
