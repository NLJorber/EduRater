

```mermaid

flowchart TD
  %% Client/UI
  subgraph Client["Client (Browser)"]
    PAGES["Pages in app/**/page.(js|jsx)"]
    COMPS["UI Components (components/*.jsx)"]
    HOOK["Auth Hook (lib/auth/useAuthProfile.js)"]
  end

  %% Server
  subgraph Server["Server (Next.js)"]
    LAYOUT["Global Layout (app/layout.js)"]
    API["API Routes (app/api/**/route.js)"]
    AUTH_SRV["Auth Server Helpers (lib/auth/server.js)"]
    SB_SRV["Supabase Server Client (lib/supabase/server.js)"]
  end

  %% External
  subgraph External["External Services"]
    SUPA["Supabase (DB/Auth)"]
  end

  %% Relationships
  LAYOUT --> PAGES
  PAGES --> COMPS
  COMPS --> HOOK

  %% UI calls API
  PAGES -->|fetch /api/...| API
  COMPS -->|fetch /api/...| API

  %% API uses server-only helpers
  API --> AUTH_SRV
  API --> SB_SRV
  SB_SRV --> SUPA
  AUTH_SRV --> SUPA

  %% Callback/login flow hint
  PAGES -->|redirect/login| SUPA
  SUPA -->|redirect back| CB["/auth/callback (app/auth/callback/page.jsx)"]
  CB --> PAGES
