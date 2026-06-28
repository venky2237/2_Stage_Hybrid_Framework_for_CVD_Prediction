import { useState, useEffect, useCallback } from "react";
import Icon from "../components/Icon";
import { getPatients, deletePatient } from "../api";

function RiskBar({ value, color }) {
  if (value === null || value === undefined)
    return <span className="mono" style={{ color:"rgba(148,163,184,0.3)", fontSize:12 }}>—</span>;
  const pct = Math.round(value * 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.05)", borderRadius:4, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:4, transition:"width 0.8s ease" }} />
      </div>
      <span className="mono" style={{ fontSize:11, color:"rgba(148,163,184,0.6)", minWidth:28 }}>{pct}%</span>
    </div>
  );
}

const PER_PAGE = 10;

export default function PatientsPage() {
  const [patients,   setPatients]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [query,      setQuery]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await getPatients({ page, per_page: PER_PAGE, name: query || undefined });
      setPatients(res.data.patients);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch {
      setError("Failed to load patients. Is the server running?");
    } finally { setLoading(false); }
  }, [page, query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setQuery(search); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patient record?")) return;
    setDeletingId(id);
    try {
      await deletePatient(id);
      fetchData();
    } catch { setError("Failed to delete patient."); }
    finally { setDeletingId(null); }
  };

  const COLS = ["Patient","Age / Gender","BMI","Blood Pressure","Clinical Risk","MRI Risk","Status","Last Checked",""];

  return (
    <div className="animate-fade">
      <div style={{ marginBottom:28 }}>
        <p className="mono" style={{ color:"rgba(34,211,238,0.5)", fontSize:10, letterSpacing:"0.2em", marginBottom:8 }}>RECORDS</p>
        <h1 className="orbitron" style={{ fontSize:28, fontWeight:700, color:"#fff" }}>Patient Records</h1>
        <p style={{ color:"rgba(148,163,184,0.5)", marginTop:6, fontSize:14 }}>{total} total patients</p>
      </div>

      {/* Search + Refresh */}
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <form onSubmit={handleSearch} style={{ display:"flex", gap:8, flex:1, maxWidth:400 }}>
          <div style={{ position:"relative", flex:1 }}>
            <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)" }}>
              <Icon name="search" size={14} color="rgba(148,163,184,0.4)" />
            </div>
            <input placeholder="Search by patient name..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft:40 }} />
          </div>
          <button type="submit" className="btn-cyan" style={{ padding:"11px 20px", fontSize:12, whiteSpace:"nowrap" }}>Search</button>
        </form>
        <button className="btn-ghost" style={{ padding:"11px 14px" }} onClick={fetchData}>
          <div className={loading ? "spin-fast" : ""} style={{ width:14, height:14, border:"1.5px solid rgba(148,163,184,0.3)", borderTopColor: loading ? "#22d3ee" : "rgba(148,163,184,0.3)", borderRadius:"50%" }} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12, background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.2)", marginBottom:16, color:"#f87171", fontSize:13 }}>
          <Icon name="alert" size={15} color="#f87171" />{error}
        </div>
      )}

      {/* Table */}
      <div className="glass" style={{ overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                {COLS.map((h) => (
                  <th key={h} className="mono" style={{ textAlign:"left", padding:"14px 16px", fontSize:9, color:"rgba(148,163,184,0.35)", letterSpacing:"0.12em", whiteSpace:"nowrap", fontWeight:500 }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign:"center", padding:"60px 0", color:"rgba(148,163,184,0.3)" }}>
                  <div className="spin-fast" style={{ width:20, height:20, border:"2px solid rgba(34,211,238,0.2)", borderTopColor:"#22d3ee", borderRadius:"50%", margin:"0 auto 10px" }} />
                  <p style={{ fontSize:13 }}>Loading records...</p>
                </td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign:"center", padding:"60px 0", color:"rgba(148,163,184,0.3)" }}>
                  <Icon name="users" size={28} color="rgba(148,163,184,0.15)" />
                  <p style={{ marginTop:10, fontSize:14 }}>No patients found</p>
                </td></tr>
              ) : patients.map((p) => (
                <tr key={p.id}
                  style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.015)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#22d3ee", flexShrink:0 }}>
                        {p.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight:600, color:"#e2e8f0" }}>{p.name}</p>
                        <p className="mono" style={{ fontSize:10, color:"rgba(148,163,184,0.3)" }}>#{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px", color:"rgba(148,163,184,0.6)", whiteSpace:"nowrap" }}>{p.age}y · {p.gender}</td>
                  <td style={{ padding:"13px 16px" }} className="mono">{p.bmi}</td>
                  <td style={{ padding:"13px 16px" }} className="mono">{p.bp}</td>
                  <td style={{ padding:"13px 16px", minWidth:120 }}><RiskBar value={p.stage1_risk} color="#22d3ee" /></td>
                  <td style={{ padding:"13px 16px", minWidth:120 }}><RiskBar value={p.stage2_risk} color="#a78bfa" /></td>
                  <td style={{ padding:"13px 16px" }}><span className={p.high_risk ? "tag-red" : "tag-green"}>{p.high_risk ? "High" : "Low"}</span></td>
                  <td style={{ padding:"13px 16px", fontSize:11 }} className="mono">{p.last_checked}</td>
                  <td style={{ padding:"13px 16px" }}>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      style={{ background:"none", border:"none", cursor:"pointer", padding:8, borderRadius:8, color:"rgba(148,163,184,0.3)", transition:"all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background="rgba(248,113,113,0.1)"; e.currentTarget.style.color="#f87171"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="rgba(148,163,184,0.3)"; }}
                    >
                      {deletingId === p.id
                        ? <div className="spin-fast" style={{ width:14, height:14, border:"1.5px solid rgba(248,113,113,0.3)", borderTopColor:"#f87171", borderRadius:"50%" }} />
                        : <Icon name="trash" size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
            <p className="mono" style={{ fontSize:11, color:"rgba(148,163,184,0.4)" }}>Page {page} of {totalPages} · {total} records</p>
            <div style={{ display:"flex", gap:6 }}>
              <button className="btn-ghost" style={{ padding:"6px 10px" }} onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1}>
                <Icon name="chevLeft" size={14} />
              </button>
              {Array.from({ length:Math.min(5,totalPages) }, (_,i) => Math.max(1,Math.min(page-2,totalPages-4))+i).map((n) => (
                <button key={n} onClick={() => setPage(n)} style={{ width:32, height:32, borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", border:n===page?"1px solid rgba(34,211,238,0.3)":"1px solid rgba(255,255,255,0.06)", background:n===page?"rgba(34,211,238,0.1)":"transparent", color:n===page?"#22d3ee":"rgba(148,163,184,0.5)" }}>
                  {n}
                </button>
              ))}
              <button className="btn-ghost" style={{ padding:"6px 10px" }} onClick={() => setPage((p) => Math.min(totalPages,p+1))} disabled={page===totalPages}>
                <Icon name="chevRight" size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
