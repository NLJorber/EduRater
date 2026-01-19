```mermaid

graph LR
  U[User / Browser] --> R[Next.js Router]

  %% Pages
  R --> H["/  → app/page.js"]
  R --> L["/login → app/login/page.jsx"]
  R --> S["/schools → app/schools/page.js"]
  R --> SU["/schools/:urn → app/schools/[urn]/page.js"]
  R --> ST["/staff → app/staff/page.jsx"]
  R --> AC["/auth/callback → app/auth/callback/page.jsx"]

  %% APIs
  R --> AP1["/api/schools → app/api/schools/route.js"]
  R --> AP2["/api/staff-requests → app/api/staff-requests/route.js"]
  R --> AP3["/api/admin/roles → app/api/admin/roles/route.js"]
  R --> AP4["/api/admin/staff-requests → app/api/admin/staff-requests/route.js"]
