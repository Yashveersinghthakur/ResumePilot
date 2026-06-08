# ✈️ ResumePilot — AI Career Platform

> Full-stack app with AI resume analysis, ATS scoring, cover letter generation, and mock interviews.

---

## 📁 Folder Structure

```
resumepilot/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── socket.js              # Socket.io handler
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, profile
│   │   ├── dashboardController.js # Stats & recent data
│   │   ├── interviewController.js # Interview CRUD + AI
│   │   └── resumeController.js    # Upload, analyze, cover letter
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + requirePlan
│   │   ├── errorHandler.js        # Global error handler
│   │   └── uploadMiddleware.js    # Multer file upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── InterviewSession.js
│   │   └── ChatHistory.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── chatbotRoutes.js
│   │   └── recommendationRoutes.js
│   ├── utils/
│   │   ├── ai.js                  # OpenAI — analyze, interview, cover letter
│   │   └── token.js               # JWT generate + send response
│   ├── server.js                  # Entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Full SPA (auth, dashboard, resumes, interviews, profile)
│   │   └── main.jsx               # React root
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173** · API at **http://localhost:5000**

---

## ⚙️ Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/resumepilot
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
CLIENT_URL=http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint                        | Description              | Auth |
|--------|---------------------------------|--------------------------|------|
| POST   | /api/auth/signup                | Register                 | ❌   |
| POST   | /api/auth/login                 | Login                    | ❌   |
| GET    | /api/auth/me                    | Get current user         | ✅   |
| PUT    | /api/auth/update-profile        | Update name/avatar       | ✅   |
| PUT    | /api/auth/change-password       | Change password          | ✅   |
| GET    | /api/dashboard                  | Stats + recent data      | ✅   |
| GET    | /api/resume                     | List resumes             | ✅   |
| POST   | /api/resume/upload              | Upload resume (PDF/DOC)  | ✅   |
| GET    | /api/resume/:id                 | Get single resume        | ✅   |
| DELETE | /api/resume/:id                 | Soft delete resume       | ✅   |
| POST   | /api/resume/:id/analyze         | Run ATS analysis         | ✅   |
| POST   | /api/resume/:id/cover-letter    | Generate cover letter    | ✅   |
| GET    | /api/interview                  | List sessions            | ✅   |
| POST   | /api/interview/start            | Start interview          | ✅   |
| GET    | /api/interview/:id              | Get session              | ✅   |
| POST   | /api/interview/:id/message      | Send message             | ✅   |
| PUT    | /api/interview/:id/end          | End + get feedback       | ✅   |

---

## 🛠 Tech Stack

**Backend:** Node.js · Express · MongoDB · Mongoose · Socket.io · OpenAI API · Multer · JWT · bcryptjs

**Frontend:** React 18 · Vite · Socket.io-client · Vanilla CSS (zero UI library)
