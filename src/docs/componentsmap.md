```mermaid

graph TD
  %% Pages
  P_HOME["app/page.js (/)"]
  P_LOGIN["app/login/page.jsx (/login)"]
  P_CALLBACK["app/auth/callback/page.jsx (/auth/callback)"]
  P_SCHOOLS["app/schools/page.js (/schools)"]
  P_SCHOOL["app/schools/[urn]/page.js (/schools/:urn)"]
  P_STAFF["app/staff/page.jsx (/staff)"]

  %% Shared layout
  LAYOUT["app/layout.js (global shell)"]
  NAV["components/NavBar.jsx"]
  ROLE_GATE["components/RoleGate.jsx"]

  %% Feature components
  MAP["components/SchoolsMap.jsx"]
  SCHOOL_CARD["components/School.jsx"]
  SCHOOL_PAGE["components/SchoolPage.jsx"]
  PROFILE["components/Profile.jsx"]
  COMMENT_FORM["components/CommentForm.jsx"]
  REVIEW_FORM["components/ParentReviewForm.jsx"]

  %% Layout wiring
  LAYOUT --> NAV
  LAYOUT --> P_HOME
  LAYOUT --> P_LOGIN
  LAYOUT --> P_CALLBACK
  LAYOUT --> P_SCHOOLS
  LAYOUT --> P_SCHOOL
  LAYOUT --> P_STAFF

  %% Likely usage
  P_HOME --> NAV
  P_SCHOOLS --> MAP
  P_SCHOOLS --> SCHOOL_CARD

  P_SCHOOL --> SCHOOL_PAGE
  SCHOOL_PAGE --> SCHOOL_CARD
  SCHOOL_PAGE --> COMMENT_FORM
  SCHOOL_PAGE --> REVIEW_FORM

  P_STAFF --> ROLE_GATE
  ROLE_GATE --> PROFILE
