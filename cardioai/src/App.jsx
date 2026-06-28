import { useState } from "react";
import "./styles/globals.css";

import AmbientBg      from "./components/AmbientBg";
import Sidebar        from "./components/Sidebar";
import AdminPinModal  from "./components/AdminPinModal";

import PredictPage    from "./pages/PredictPage";
import DashboardPage  from "./pages/DashboardPage";
import PatientsPage   from "./pages/PatientsPage";
import Icon           from "./components/Icon";

export default function App() {
  const [page,         setPage]         = useState("predict");
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    setShowPinModal(false);
    setPage("dashboard");
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#030712" }}>
      <AmbientBg />

      <Sidebar
        page={page}
        setPage={setPage}
        isAdmin={isAdmin}
        onAdminClick={() => setShowPinModal(true)}
      />

      <main style={{ flex:1, position:"relative", zIndex:10, padding:"40px", overflowY:"auto", minHeight:"100vh" }}>
        {page === "predict"    && <PredictPage />}
        {page === "dashboard"  && isAdmin && <DashboardPage setPage={setPage} />}
        {page === "patients"   && isAdmin && <PatientsPage />}

        {/* Fallback if admin page accessed without auth */}
        {(page === "dashboard" || page === "patients") && !isAdmin && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:16 }}>
            <Icon name="lock" size={40} color="rgba(148,163,184,0.2)" />
            <p style={{ color:"rgba(148,163,184,0.4)", fontSize:15 }}>Admin access required</p>
          </div>
        )}
      </main>

      {showPinModal && (
        <AdminPinModal
          onSuccess={handleAdminSuccess}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  );
}
