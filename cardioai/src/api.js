import axios from "axios";

const BASE = "http://localhost:5000";

const api = axios.create({ baseURL: BASE });

/* ── Clinical prediction
   POST /predict_clinical
   Body: { name, age, gender, height, weight, ap_hi, ap_lo,
           cholesterol, gluc, smoke, alco, active }
   Returns: { bmi, cholesterol_category, glucose_category,
              health_index, high_risk, patient_id,
              pulse_pressure, risk_probability, chol_gluc_interaction }
*/
export const predictClinical = (data) =>
  api.post("/predict_clinical", data);

/* ── MRI prediction
   POST /predict_mri
   Body: FormData with field "image" (image file)
   Returns: { mri_probability, high_risk, patient_id, ... }
*/
export const predictMRI = (formData) =>
  api.post("/predict_mri", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/* ── Download PDF report
   GET /report
   Returns: PDF blob
*/
export const downloadReport = () =>
  api.get("/download_report", { responseType: "blob" });

/* ── Get patients (paginated + optional name search)
   GET /admin/patients?page=1&per_page=10&name=John
   Returns: { patients: [...], total, total_pages }
*/
export const getPatients = ({ page = 1, per_page = 10, name } = {}) => {
  const params = { page, per_page };
  if (name) params.name = name;
  return api.get("/admin/patients", { params });
};

/* ── Delete patient
   DELETE /admin/patients/:id
*/
export const deletePatient = (id) =>
  api.delete(`/admin/patients/${id}`);
