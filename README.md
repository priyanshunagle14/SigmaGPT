# ⚡ SigmaGPT

SigmaGPT is a modern, high-performance, full-stack AI conversational platform modeled after ChatGPT. Powered by **Groq LPU Acceleration**, **Express.js**, **MongoDB**, and **React 19 with Vite**, SigmaGPT provides lightning-fast real-time streaming AI responses, user authentication, and full chat thread management.

Developed by **Priyanshu Nagle**.

---

## ✨ Features

- ⚡ **Real-Time Token Streaming**: Real-time response generation powered by Server-Sent Events (SSE) for zero latency waiting.
- 🧠 **High-Speed AI Engine**: Powered by Groq LPU API acceleration for ultra-fast completions using open-weights LLMs.
- 🔐 **User Authentication & Guest Mode**:
  - Secure JWT authentication with password hashing (bcryptjs).
  - Guest mode for instant exploration without account creation.
- 💬 **Conversation Management**:
  - Automatic smart title generation based on initial prompt.
  - Custom thread renaming and deletion.
  - "Clear All Conversations" option.
  - Persistent message history stored in MongoDB.
- 🎨 **Modern Dark UI/UX**:
  - Sleek dark design system with glassmorphism effects and micro-interactions.
  - Full Markdown rendering (code syntax highlighting via `rehype-highlight`, GFM tables, and copy-to-clipboard buttons).
  - Quick-start prompt suggestion tiles.
  - Fully responsive drawer layout for mobile and desktop screens.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: `react-router-dom` (v7)
- **Styling**: Vanilla CSS3 (Custom Design Tokens, Flexbox/Grid, Dark Mode)
- **Markdown Parsing**: `react-markdown`, `remark-gfm`, `rehype-highlight`
- **Icons & UI**: Custom SVG Icon system & `react-spinners`

### Backend
- **Runtime**: Node.js ES Modules
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ORM
- **AI API Integration**: Groq Cloud API (OpenAI-compatible endpoints with streaming reader)
- **Auth & Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS middleware

---

## 📁 Repository Structure

```text
SigmaGPT/
├── Backend/
│   ├── middleware/
│   │   └── auth.js         # JWT validation middleware
│   ├── models/
│   │   ├── Thread.js       # Chat thread & message schema
│   │   └── User.js         # User account schema
│   ├── routes/
│   │   ├── auth.js         # Signup, login, auth check routes
│   │   └── chat.js         # Chat streaming, message history, thread CRUD routes
│   ├── utils/
│   │   └── localAi.js      # Groq API streaming & completion handlers
│   ├── .env                # Backend environment variables
│   ├── package.json
│   └── server.js           # Express app & database connection
├── Frontend/
│   ├── src/
│   │   ├── components/     # UI Components (PromptSuggestions, etc.)
│   │   ├── context/        # Auth Context state manager
│   │   ├── services/       # API call utilities
│   │   ├── ChatWindow.jsx  # Main conversation UI & streaming parser
│   │   ├── Sidebar.jsx     # Thread history navigation drawer
│   │   ├── Login.jsx       # Auth Login screen
│   │   ├── Signup.jsx      # Auth Registration screen
│   │   ├── App.jsx         # Router & main app layout
│   │   └── main.jsx
│   ├── .env                # Frontend environment variables
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **MongoDB** instance (Local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Groq API Key** (Get one at [console.groq.com](https://console.groq.com))

---

### 1. Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `Backend` directory with the following variables:
   ```env
   PORT=8080
   MONGO_URL=your_mongodb_connection_string
   GROQ_API_KEY=your_groq_api_key
   secret=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend API will run on `http://localhost:8080`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The frontend application will run on `http://localhost:5173`.*

---

## 📡 API Endpoints

### 🔐 Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Register a new user account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | ❌ No |
| `GET` | `/api/auth/me` | Fetch active user credentials | ✅ Yes |

### 💬 Chat Routes (`/api`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/chat/stream` | Stream AI response via SSE | Optional (Guest/User) |
| `POST` | `/api/chat` | Standard JSON AI chat response | Optional (Guest/User) |
| `GET` | `/api/thread` | Retrieve all user threads | ✅ Yes |
| `GET` | `/api/thread/:threadId` | Fetch messages for a specific thread | ✅ Yes |
| `PATCH` | `/api/thread/:threadId` | Rename thread title | ✅ Yes |
| `DELETE` | `/api/thread/:threadId` | Delete a single thread | ✅ Yes |
| `DELETE` | `/api/thread` | Clear all user thread history | ✅ Yes |

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
