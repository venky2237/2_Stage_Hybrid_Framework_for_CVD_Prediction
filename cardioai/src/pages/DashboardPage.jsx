import { useEffect, useState } from "react";
import Icon from "../components/Icon";
import { getPatients } from "../api";

export default function DashboardPage({ setPage }) {
  const [stats,  setStats]  = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getPatients({ page: 1, per_page: 5 })
      .then((res) => {
        const { patients, total } = res.data;
        setRecent(patients);
        const highRisk = patients.filter((p) => p.high_risk).length;
        setStats({
          total,
          highRisk,
          lowRisk: total - highRisk,
          withMRI: patients.filter((p) => p.stage2_risk !== null).length,
        });
      })
      .catch(() => setError("Could not load patient data. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  const highPct = stats?.total ? Math.round((stats.highRisk / stats.total) * 100) : 0;

  const STATS = [
    { label:"Total Patients", value: stats?.total    ?? "—", icon:"users",    color:"#22d3ee", bg:"rgba(34,211,238,0.1)",  border:"rgba(34,211,238,0.2)"  },
    { label:"High Risk",      value: stats?.highRisk ?? "—", icon:"alert",    color:"#f87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.2)" },
    { label:"Low Risk",       value: stats?.lowRisk  ?? "—", icon:"check",    color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.2)"  },
    { label:"MRI Scanned",    value: stats?.withMRI  ?? "—", icon:"scan",     color:"#a78bfa", bg:"rgba(167,139,250,0.1)", border:"rgba(167,139,250,0.2)" },
  ];

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom:32, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p className="mono" style={{ color:"rgba(34,211,238,0.5)", fontSize:10, letterSpacing:"0.2em", marginBottom:8 }}>ADMIN OVERVIEW</p>
          <h1 className="orbitron" style={{ fontSize:28, fontWeight:700, color:"#fff" }}>Dashboard</h1>
          <p style={{ color:"rgba(148,163,184,0.5)", marginTop:8, fontSize:14 }}>Monitor patient risk assessments and diagnostic results</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:20, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)" }}>
          <span style={{ position:"relative", width:8, height:8, display:"flex" }}>
            <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:"#34d399", animation:"ping 1.5s ease-out infinite" }} />
            <span style={{ position:"relative", display:"block", width:8, height:8, borderRadius:"50%", background:"#34d399" }} />
          </span>
          <span className="mono" style={{ color:"#34d399", fontSize:12, fontWeight:500 }}>System Live</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12, background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.2)", marginBottom:20, color:"#f87171", fontSize:13 }}>
          <Icon name="alert" size={15} color="#f87171" />{error}
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:16 }}>
        {STATS.map(({ label, value, icon, color, bg, border }, i) => (
          <div key={label} className="animate-fade" style={{ animationDelay:`${i*80}ms`, background:`linear-gradient(145deg,${bg},rgba(2,10,32,0.75))`, border:`1px solid ${border}`, borderRadius:16, padding:20 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:bg, border:`1px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name={icon} size={15} color={color} />
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:24, opacity:0.3 }}>
                {[35,58,42,72,50,84,64].map((h, j) => <div key={j} style={{ width:3, height:`${h}%`, background:color, borderRadius:2 }} />)}
              </div>
            </div>
            <p className="orbitron" style={{ fontSize:32, fontWeight:900, color:"#fff", letterSpacing:"-0.02em" }}>
              {loading ? <span style={{ opacity:0.3 }}>...</span> : value}
            </p>
            <p className="mono" style={{ color:`${color}80`, fontSize:9, letterSpacing:"0.15em", marginTop:4 }}>{label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Risk split bar */}
      {stats && (
        <div style={{ background:"rgba(2,10,32,0.6)", borderRadius:14, border:"1px solid rgba(255,255,255,0.05)", padding:"14px 20px", marginBottom:24, display:"flex", alignItems:"center", gap:16 }}>
          <p className="mono" style={{ color:"rgba(148,163,184,0.4)", fontSize:9, letterSpacing:"0.15em", whiteSpace:"nowrap" }}>RISK SPLIT</p>
          <div style={{ flex:1, height:4, borderRadius:4, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
            <div style={{ width:`${highPct}%`, height:"100%", borderRadius:4, background:"linear-gradient(90deg,#f87171,#fbbf24)", boxShadow:"0 0 10px rgba(248,113,113,0.4)", transition:"width 1s ease" }} />
          </div>
          <div style={{ display:"flex", gap:12, fontFamily:"JetBrains Mono", fontSize:12, whiteSpace:"nowrap" }}>
            <span style={{ color:"#f87171", fontWeight:600 }}>{highPct}% high</span>
            <span style={{ color:"rgba(148,163,184,0.2)" }}>·</span>
            <span style={{ color:"#34d399", fontWeight:600 }}>{100-highPct}% low</span>
          </div>
        </div>
      )}

      {/* CTA + Recent patients */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16 }}>
        {/* CTA */}
        <div style={{ position:"relative", overflow:"hidden", borderRadius:16, border:"1px solid rgba(34,211,238,0.15)", background:"linear-gradient(150deg,rgba(34,211,238,0.09),rgba(2,10,32,0.9) 55%)", backdropFilter:"blur(16px)", padding:24, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <div style={{ position:"absolute", bottom:-40, right:-40, width:160, height:160, borderRadius:"50%", border:"1px solid rgba(34,211,238,0.06)", pointerEvents:"none" }} />
          <div>
            <div style={{ width:44, height:44, borderRadius:12, background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.22)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <Icon name="trending" size={20} color="#22d3ee" />
            </div>
            <h2 style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:8 }}>New Assessment</h2>
            <p style={{ color:"rgba(148,163,184,0.5)", fontSize:13, lineHeight:1.6 }}>Run a full cardiovascular risk prediction using clinical data and cardiac MRI.</p>
          </div>
          <button className="btn-cyan" style={{ marginTop:20, width:"100%" }} onClick={() => setPage("predict")}>
            <Icon name="arrow" size={14} color="#22d3ee" /> START PREDICTION
          </button>
        </div>

        {/* Recent patients */}
        <div className="glass" style={{ padding:22 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div>
              <h2 style={{ fontSize:15, fontWeight:700, color:"#fff" }}>Recent Patients</h2>
              <p style={{ color:"rgba(148,163,184,0.4)", fontSize:12, marginTop:2 }}>Latest 5 records</p>
            </div>
            <button className="btn-ghost" style={{ padding:"6px 14px", fontSize:12 }} onClick={() => setPage("patients")}>
              View all <Icon name="arrow" size={11} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(148,163,184,0.3)" }}>
              <div className="spin-fast" style={{ width:20, height:20, border:"2px solid rgba(34,211,238,0.2)", borderTopColor:"#22d3ee", borderRadius:"50%", margin:"0 auto 10px" }} />
              <p style={{ fontSize:13 }}>Loading...</p>
            </div>
          ) : recent.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(148,163,184,0.3)" }}>
              <Icon name="users" size={28} color="rgba(148,163,184,0.15)" />
              <p style={{ marginTop:10, fontSize:13 }}>No patients yet. Run a prediction to get started.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {recent.map((p) => (
                <div key={p.id} onClick={() => setPage("patients")}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(34,211,238,0.15)"; e.currentTarget.style.background="rgba(34,211,238,0.02)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.04)"; e.currentTarget.style.background="transparent"; }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,rgba(34,211,238,0.2),rgba(99,102,241,0.1))", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#22d3ee", flexShrink:0 }}>
                      {p.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{p.name}</p>
                      <p className="mono" style={{ fontSize:10, color:"rgba(148,163,184,0.35)" }}>{p.last_checked}</p>
                    </div>
                  </div>
                  <span className={p.high_risk ? "tag-red" : "tag-green"}>{p.high_risk ? "High Risk" : "Low Risk"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
