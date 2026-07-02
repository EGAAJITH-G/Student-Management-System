# EduPortal - Student Management System

EduPortal is an institutional-grade, full-stack **Student Management System** built on the MERN Stack. It handles student cohorts, daily attendance registries, multi-subject semester marksheets, weighted GPA metrics, and system security logs. 

Built using a decoupled architecture, it leverages modern technologies to provide high-speed CRUD operations, real-time Socket.IO synchronization, and a fully responsive user interface.

---

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Restricts access levels dynamically across three distinct roles:
    *   **Admin:** Full read/write privileges, user management, profile deletions, and access to system-wide Security Audit Trails.
    *   **Staff:** Editor privileges to manage student profiles, mark daily attendance sheets, and input semester subject scores.
    *   **Student:** Read-only dashboard showing personal attendance statistics, semester grades, and calculated weighted GPA logs.
*   **Registration Safety Passcodes:** To prevent role escalation, registering as an **Admin** or **Staff** requires specific security keys:
    *   Admin key: `admin2026`
    *   Staff key: `staff2026`
*   **Real-time Synchronization (WebSockets):** Synchronizes concurrent browser screens instantly using Socket.IO. Adding, updating, or deleting student profiles triggers real-time UI refreshes and Toast notifications for other logged-in users.
*   **Academic Grading & GPA Engine:** Automatically calculates subject grades (O, A+, A, B+, B, C, F) and GPAs on the backend based on credit weights and mark percentages:
    $$\text{GPA} = \frac{\sum (\text{Grade Points} \times \text{Credits})}{\sum \text{Credits}}$$
*   **Security Ledger (Audit Logs):** Tracks administrative events (logins, account creations, profile updates, deletions) with timestamped records mapping the target model and responsible administrator.
*   **SMTP Password Recovery:** Standard OTP-based account recovery flow using simulated SMTP mail services (printing simulated codes straight to the Node server console).

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | ReactJS | `v18.3.1` | Core client library rendering state-driven components |
| | Redux Toolkit | `v2.12.0` | Global state management (`studentsSlice`, `marksSlice`, `notificationSlice`) |
| | Vite | `v5.2.11` | Builder/compiler for fast compilation and optimized bundles |
| | Axios | `v1.7.2` | HTTP connector with request interceptors to inject JWT Bearer headers |
| **Backend** | Node.js / Express | `v4.19.2` | Runs REST endpoints, validations, and controller functions |
| | Socket.IO | `v4.8.3` | Full-duplex WebSocket connections for live broadcasts |
| | Bcryptjs | `v3.0.3` | Hashes passwords with 10 salt rounds prior to DB inserts |
| | express-validator | - | Validates input formats and sanitizes request payloads |
| **Database** | MongoDB | - | JSON document store |
| | Mongoose ODM | `v8.4.1` | Configures database validation schemas and composite indexes |

---

## 📁 Folder Directory Structure

```
root/
├── backend/
│   ├── config/          # Database connection, Cloudinary, and Swagger settings
│   ├── controllers/     # Controller logic (Auth, Students, Marks, Attendance)
│   ├── middleware/      # JWT authentication, role gates, input validations
│   ├── models/          # Mongoose Schemas (User, Student, Attendance, Marks, AuditLog)
│   ├── routes/          # Express route trees
│   ├── seed.js          # DB database seeding script
│   └── server.js        # Bootstraps Express and Socket.IO servers
├── frontend/
│   ├── src/
│   │   ├── components/  # Sidebar sliding drawer, Navbar, StudentTable, Skeletons
│   │   ├── context/     # AuthContext session provider
│   │   ├── pages/       # Home, Analytics dashboard, Attendance registry, Marks input, AuditLogs
│   │   ├── services/    # Axios HTTP and Socket.IO WebSocket connectors
│   │   └── store/       # Redux store slices
│   └── vite.config.js   # Vite configuration with proxy rules
└── .gitignore           # Ignores node_modules, build outputs, and .env files
```

---

## 🔑 Seed Credentials Quick Reference

To populate your database with dummy datasets, run `node seed.js` in the `backend/` folder. This clears previous entries and populates mock collections (150 Marks rows, 120 attendance entries, and 5 initial audit records).

| Account Role | Seed Email | Seed Password | Registration Secret Key |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@eduportal.com` | `password123` | `admin2026` |
| **Staff** | `staff@eduportal.com` | `password123` | `staff2026` |
| **Student** | `aarav.sharma@edu.com` | `password123` | *N/A* (Free signup) |

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `backend/` directory and configure the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signature_secret_key
ADMIN_REGISTRATION_KEY=admin2026
STAFF_REGISTRATION_KEY=staff2026
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## ⚡ Execution Instructions

Follow these CLI terminal commands to run the application locally:

### 1. Database Seeding
Navigate to the backend directory and seed initial mock records:
```bash
cd backend
node seed.js
```

### 2. Run API Backend Server
Start the Express server on port 5000:
```bash
npm install
npm run dev
```

### 3. Run React Frontend Client
Open a separate terminal window, navigate to the frontend directory, install dependencies, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
The client dashboard should now be accessible at `http://localhost:5173`.

---

## 🧪 Verification Checklists

Verify system integrity using the following manual QA test paths:

1.  **Real-Time Sync Checks:**
    *   Open two browser tabs side-by-side: Session A logged in as Admin, and Session B logged in as Staff.
    *   In Session B, add a student profile.
    *   Verify that Session A receives a green Toastify banner warning instantly, and the student table grid updates page 1 automatically without manual page reloading.
2.  **Responsive drawer views:**
    *   Toggle responsive mobile emulators in the browser inspection tool ($< 768\text{px}$).
    *   Verify the sidebar menu disappears, and clicking the hamburger icon in the top header slides the menu drawer in smoothly from the left.
3.  **Password OTP Recovers:**
    *   On the login page, trigger "Forgot Password" for `admin@eduportal.com`.
    *   Inspect your active Node console shell terminal to read the simulated recovery OTP: `[SMTP SIMULATOR] OTP Recovery code for admin@eduportal.com: XXXXXX`.
    *   Verify inputting the code successfully resets the account password.
4.  **Audit Ledger Gates:**
    *   Verify that only accounts logged in as **Admin** can access the `/api/audit-logs` endpoint or view the Audit Logs page. Staff or Student logins attempting to access the logs page should be redirected to the home page.
