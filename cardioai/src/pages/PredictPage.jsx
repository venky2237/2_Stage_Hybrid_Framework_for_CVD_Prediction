import { useState } from "react";
import Icon from "../components/Icon";
import RiskGauge from "../components/RiskGauge";
import { predictClinical, predictMRI, downloadReport } from "../api";

const INITIAL_FORM = {
  name: "", age: "", gender: "1", height: "", weight: "",
  ap_hi: "", ap_lo: "", cholesterol: "", gluc: "",
  smoke: "0", alco: "0", active: "1",
};

const STEPS = [
  { label: "Clinical Data" },
  { label: "Cardiac MRI"  },
  { label: "Results"      },
];

function Label({ children }) {
  return <p className="mono" style={{ color:"rgba(148,163,184,0.5)", fontSize:10, letterSpacing:"0.12em", marginBottom:6 }}>{children}</p>;
}

function SectionCard({ title, icon, iconColor, iconBg, iconBorder, children }) {
  return (
    <div className="glass-cyan scan-container" style={{ padding:28, marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:iconBg, border:`1px solid ${iconBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name={icon} size={13} color={iconColor} />
        </div>
        <h2 style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function PredictPage() {
  const [step,           setStep]           = useState(1);
  const [form,           setForm]           = useState(INITIAL_FORM);
  const [mriFile,        setMriFile]        = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [clinicalResult, setClinicalResult] = useState(null);
  const [mriResult,      setMriResult]      = useState(null);

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const submitClinical = async () => {
    setError(""); setLoading(true);
    try {
      const payload = {
        name:        form.name,
        age:         Number(form.age),
        gender:      Number(form.gender),
        height:      Number(form.height),
        weight:      Number(form.weight),
        ap_hi:       Number(form.ap_hi),
        ap_lo:       Number(form.ap_lo),
        cholesterol: Number(form.cholesterol),
        gluc:        Number(form.gluc),
        smoke:       Number(form.smoke),
        alco:        Number(form.alco),
        active:      Number(form.active),
      };
      const res = await predictClinical(payload);
      setClinicalResult(res.data);
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.error || "Clinical prediction failed. Is the server running at localhost:5000?");
    } finally { setLoading(false); }
  };

  const submitMRI = async () => {
    if (!mriFile) return;
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", mriFile);
      const res = await predictMRI(fd);
      setMriResult(res.data);
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.error || "MRI prediction failed.");
    } finally { setLoading(false); }
  };

  const handleDownload = async () => {
    try {
      const res = await downloadReport();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = "cardio_report.pdf"; a.click();
      window.URL.revokeObjectURL(url);
    } catch { setError("Failed to download report."); }
  };

  const reset = () => {
    setStep(1); setForm(INITIAL_FORM); setMriFile(null);
    setClinicalResult(null); setMriResult(null); setError("");
  };

  const canSubmit = form.name && form.age && form.height && form.weight && form.ap_hi && form.ap_lo && form.cholesterol && form.gluc;

  return (
    <div className="animate-fade" style={{ maxWidth:720, margin:"0 auto" }}>
      <div style={{ marginBottom:32 }}>
        <p className="mono" style={{ color:"rgba(34,211,238,0.5)", fontSize:10, letterSpacing:"0.2em", marginBottom:8 }}>CARDIOVASCULAR RISK ASSESSMENT</p>
        <h1 className="orbitron" style={{ fontSize:28, fontWeight:700, color:"#fff" }}>New Prediction</h1>
        <p style={{ color:"rgba(148,163,184,0.5)", marginTop:8, fontSize:14 }}>AI-powered multi-stage cardiovascular risk analysis</p>
      </div>

      {/* Steps */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
        {STEPS.map(({ label }, i) => {
          const n = i+1, done = step > n, active = step === n;
          return (
            <div key={n} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : "none" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:90 }}>
                <div style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${done?"rgba(52,211,153,0.4)":active?"rgba(34,211,238,0.4)":"rgba(255,255,255,0.1)"}`, background:done?"rgba(52,211,153,0.12)":active?"rgba(34,211,238,0.12)":"rgba(255,255,255,0.03)", color:done?"#34d399":active?"#22d3ee":"rgba(148,163,184,0.3)", fontSize:12, fontFamily:"Orbitron,monospace", fontWeight:700, boxShadow:active?"0 0 16px rgba(34,211,238,0.2)":"none", transition:"all 0.3s" }}>
                  {done ? <Icon name="check" size={14} color="#34d399" /> : n}
                </div>
                <p style={{ fontSize:11, fontWeight:600, color:done?"#34d399":active?"#22d3ee":"rgba(148,163,184,0.3)" }}>{label}</p>
              </div>
              {i < 2 && <div style={{ flex:1, height:1, background:done?"rgba(52,211,153,0.3)":"rgba(255,255,255,0.06)", marginBottom:20, transition:"background 0.5s" }} />}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12, background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.2)", marginBottom:20, color:"#f87171", fontSize:13 }}>
          <Icon name="alert" size={15} color="#f87171" />{error}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="animate-slide">
          <SectionCard title="Patient Demographics" icon="users" iconColor="#22d3ee" iconBg="rgba(34,211,238,0.1)" iconBorder="rgba(34,211,238,0.2)">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={{ gridColumn:"1/-1" }}><Label>PATIENT NAME</Label><input placeholder="Full name" value={form.name} onChange={f("name")} /></div>
              <div><Label>AGE (YEARS)</Label><input type="number" placeholder="45" value={form.age} onChange={f("age")} /></div>
              <div><Label>GENDER</Label><select value={form.gender} onChange={f("gender")}><option value="1">Female</option><option value="2">Male</option></select></div>
              <div><Label>HEIGHT (cm)</Label><input type="number" placeholder="170" value={form.height} onChange={f("height")} /></div>
              <div><Label>WEIGHT (kg)</Label><input type="number" placeholder="75" value={form.weight} onChange={f("weight")} /></div>
            </div>
          </SectionCard>

          <SectionCard title="Cardiovascular Vitals" icon="activity" iconColor="#f87171" iconBg="rgba(248,113,113,0.1)" iconBorder="rgba(248,113,113,0.2)">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div><Label>SYSTOLIC BP (mmHg)</Label><input type="number" placeholder="130" value={form.ap_hi} onChange={f("ap_hi")} /></div>
              <div><Label>DIASTOLIC BP (mmHg)</Label><input type="number" placeholder="85" value={form.ap_lo} onChange={f("ap_lo")} /></div>
              <div><Label>CHOLESTEROL (mg/dL)</Label><input type="number" placeholder="210" value={form.cholesterol} onChange={f("cholesterol")} /></div>
              <div><Label>GLUCOSE (mg/dL)</Label><input type="number" placeholder="95" value={form.gluc} onChange={f("gluc")} /></div>
            </div>
          </SectionCard>

          <SectionCard title="Lifestyle Factors" icon="sparkle" iconColor="#a78bfa" iconBg="rgba(167,139,250,0.1)" iconBorder="rgba(167,139,250,0.2)">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
              <div><Label>SMOKING</Label><select value={form.smoke} onChange={f("smoke")}><option value="0">No</option><option value="1">Yes</option></select></div>
              <div><Label>ALCOHOL</Label><select value={form.alco} onChange={f("alco")}><option value="0">No</option><option value="1">Yes</option></select></div>
              <div><Label>PHYSICALLY ACTIVE</Label><select value={form.active} onChange={f("active")}><option value="1">Yes</option><option value="0">No</option></select></div>
            </div>
          </SectionCard>

          <button className="btn-cyan" onClick={submitClinical} disabled={loading || !canSubmit} style={{ width:"100%", padding:"14px 0", fontSize:13 }}>
            {loading
              ? <><div className="spin-fast" style={{ width:16, height:16, border:"2px solid rgba(34,211,238,0.3)", borderTopColor:"#22d3ee", borderRadius:"50%" }} /> ANALYZING CLINICAL DATA...</>
              : <><Icon name="activity" size={15} color="#22d3ee" /> RUN CLINICAL ANALYSIS <Icon name="chevRight" size={14} color="#22d3ee" /></>}
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && clinicalResult && (
        <div className="animate-slide">
          <div style={{ borderRadius:16, padding:24, marginBottom:20, backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"space-between", border:`1px solid ${clinicalResult.high_risk?"rgba(248,113,113,0.25)":"rgba(52,211,153,0.25)"}`, background:clinicalResult.high_risk?"linear-gradient(135deg,rgba(248,113,113,0.08),rgba(2,10,32,0.9))":"linear-gradient(135deg,rgba(52,211,153,0.08),rgba(2,10,32,0.9))" }}>
            <div>
              <p className="mono" style={{ color:"rgba(148,163,184,0.4)", fontSize:10, letterSpacing:"0.15em", marginBottom:6 }}>CLINICAL RISK SCORE</p>
              <p className="orbitron" style={{ fontSize:48, fontWeight:900, color:"#fff", lineHeight:1 }}>
                {Math.round(clinicalResult.risk_probability * 100)}<span style={{ fontSize:20, color:"rgba(148,163,184,0.5)", fontWeight:400 }}>%</span>
              </p>
              <p style={{ color:"rgba(148,163,184,0.5)", fontSize:12, marginTop:8 }}>
                BMI: <span style={{ color:"#e2e8f0" }}>{clinicalResult.bmi}</span> &nbsp;·&nbsp; Cholesterol: <span style={{ color:"#e2e8f0" }}>{clinicalResult.cholesterol_category}</span>
              </p>
            </div>
            <span className={clinicalResult.high_risk ? "tag-red" : "tag-green"} style={{ fontSize:13, padding:"6px 16px" }}>
              {clinicalResult.high_risk ? "High Risk" : "Low Risk"}
            </span>
          </div>

          <div className="glass" style={{ padding:28, marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name="scan" size={13} color="#a78bfa" />
              </div>
              <div>
                <h2 style={{ fontSize:15, fontWeight:700, color:"#fff" }}>Cardiac MRI Upload</h2>
                <p style={{ color:"rgba(148,163,184,0.4)", fontSize:12, marginTop:2 }}>Upload for Stage 2 deep-learning analysis</p>
              </div>
            </div>
            <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:14, padding:40, cursor:"pointer", transition:"all 0.3s", border:mriFile?"1.5px solid rgba(167,139,250,0.4)":"1.5px dashed rgba(167,139,250,0.2)", background:mriFile?"rgba(167,139,250,0.05)":"rgba(2,6,20,0.4)" }}>
              <div style={{ width:52, height:52, borderRadius:14, marginBottom:14, display:"flex", alignItems:"center", justifyContent:"center", background:mriFile?"rgba(167,139,250,0.15)":"rgba(167,139,250,0.06)", border:`1px solid ${mriFile?"rgba(167,139,250,0.35)":"rgba(167,139,250,0.15)"}` }}>
                {mriFile ? <Icon name="check" size={22} color="#a78bfa" /> : <Icon name="upload" size={22} color="rgba(167,139,250,0.7)" />}
              </div>
              <p style={{ color:"#e2e8f0", fontSize:14, fontWeight:600 }}>{mriFile ? mriFile.name : "Click to upload MRI image"}</p>
              <p style={{ color:"rgba(148,163,184,0.4)", fontSize:12, marginTop:4 }}>{mriFile ? `${(mriFile.size/1024).toFixed(1)} KB` : ".jpg, .png — max 10MB"}</p>
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => setMriFile(e.target.files[0])} />
            </label>
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-ghost" style={{ flex:1, padding:"13px 0" }} onClick={() => setStep(3)}>Skip MRI</button>
            <button onClick={submitMRI} disabled={!mriFile || loading} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, borderRadius:10, padding:"13px 0", background:"linear-gradient(135deg,#a78bfa,#8b5cf6)", color:"#0d0520", fontSize:12, fontFamily:"Orbitron,monospace", fontWeight:700, border:"none", cursor:mriFile&&!loading?"pointer":"not-allowed", opacity:!mriFile||loading?0.45:1, letterSpacing:"0.08em" }}>
              {loading ? <><div className="spin-fast" style={{ width:15, height:15, border:"2px solid rgba(13,5,32,0.3)", borderTopColor:"#0d0520", borderRadius:"50%" }} /> ANALYZING...</> : <><Icon name="scan" size={15} color="#0d0520" /> RUN MRI ANALYSIS</>}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="animate-slide">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            {clinicalResult && <RiskGauge value={clinicalResult.risk_probability} label="Clinical Risk Score" />}
            {mriResult
              ? <RiskGauge value={mriResult.mri_probability} label="MRI Risk Score" />
              : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:16, border:"1px solid rgba(255,255,255,0.06)", background:"rgba(2,10,32,0.5)", padding:24 }}>
                  <Icon name="scan" size={32} color="rgba(148,163,184,0.2)" />
                  <p style={{ color:"rgba(148,163,184,0.3)", fontSize:12, marginTop:10 }}>MRI Not Analyzed</p>
                </div>}
          </div>

          {clinicalResult && (
            <div className="glass" style={{ padding:24, marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                <Icon name="sparkle" size={14} color="#22d3ee" />
                <h3 style={{ fontSize:14, fontWeight:700, color:"#fff" }}>Detailed Metrics</h3>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {[
                  ["BMI",            clinicalResult.bmi],
                  ["Pulse Pressure", clinicalResult.pulse_pressure],
                  ["Health Index",   clinicalResult.health_index],
                  ["Cholesterol",    clinicalResult.cholesterol_category],
                  ["Glucose",        clinicalResult.glucose_category],
                  ["Patient ID",     `#${clinicalResult.patient_id}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background:"rgba(2,6,20,0.5)", borderRadius:10, padding:14, border:"1px solid rgba(255,255,255,0.05)" }}>
                    <p className="mono" style={{ color:"rgba(148,163,184,0.4)", fontSize:10, letterSpacing:"0.1em", marginBottom:4 }}>{k.toUpperCase()}</p>
                    <p className="orbitron" style={{ color:"#e2e8f0", fontSize:16, fontWeight:700 }}>{v ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-ghost" style={{ flex:1, padding:"13px 0" }} onClick={reset}><Icon name="refresh" size={14} /> New Assessment</button>
            <button onClick={handleDownload} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, borderRadius:10, padding:"13px 0", background:"linear-gradient(135deg,#22d3ee,#06b6d4)", color:"#020d1a", fontSize:12, fontFamily:"Orbitron,monospace", fontWeight:700, border:"none", cursor:"pointer", letterSpacing:"0.08em" }}>
              <Icon name="download" size={15} color="#020d1a" /> DOWNLOAD REPORT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
