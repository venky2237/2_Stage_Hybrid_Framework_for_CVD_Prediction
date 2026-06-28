export const MOCK_PATIENTS = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: [
    "Priya Sharma","Rahul Mehta","Ananya Gupta","Vikram Singh","Neha Patel",
    "Arun Kumar","Deepika Nair","Suresh Reddy","Kavitha Rao","Arjun Verma",
    "Sunita Joshi","Mohammed Ali","Lakshmi Iyer","Rajesh Khanna","Pooja Mishra",
    "Sanjay Bose","Meera Pillai","Naveen Desai",
  ][i],
  age:    [45,62,38,55,49,67,41,58,52,44,70,35,63,48,39,57,66,43][i],
  gender: ["F","M","F","M","F","M","F","M","F","M","F","M","F","M","F","M","F","M"][i],
  bmi:    [24.2,28.7,22.1,31.4,26.8,29.3,23.5,27.9,25.1,24.8,30.2,21.7,28.4,25.6,22.9,26.3,27.1,23.8][i],
  bp:     ["120/80","145/92","118/76","138/88","128/84","152/95","115/74","142/90","125/82","122/78","155/98","112/72","148/94","130/85","119/77","136/87","150/96","121/79"][i],
  stage1_risk: [0.23,0.71,0.15,0.68,0.42,0.83,0.19,0.65,0.38,0.28,0.87,0.12,0.74,0.45,0.21,0.59,0.79,0.31][i],
  stage2_risk: [null,0.68,null,0.72,0.38,0.85,null,0.61,null,0.24,0.89,null,0.70,0.42,null,0.55,0.82,null][i],
  high_risk:   [false,true,false,true,false,true,false,true,false,false,true,false,true,false,false,true,true,false][i],
  last_checked:["2025-12-01","2025-11-28","2025-12-03","2025-11-30","2025-12-02","2025-11-27","2025-12-04","2025-11-29","2025-12-01","2025-12-05","2025-11-26","2025-12-06","2025-11-25","2025-12-02","2025-12-07","2025-11-28","2025-11-24","2025-12-03"][i],
}));
