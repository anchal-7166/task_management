# TaskFlow — Full Stack Task Management Application

A production-ready task management application built with **Next.js 14**, **MongoDB**, **Tailwind CSS**, and **TypeScript**.

---

## Architecture Overview

```
taskflow/
├── app/
│   ├── (auth)/                  # Auth route group (login, register)
│   ├── api/
│   │   ├── auth/                # JWT auth endpoints
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   └── tasks/               # Task CRUD endpoints
│   │       ├── route.ts         # GET (list) + POST (create)
│   │       └── [id]/route.ts    # GET, PUT, DELETE by ID
│   ├── dashboard/               # Protected pages
│   │   ├── layout.tsx           # Sidebar layout
│   │   ├── page.tsx             # Overview with stats
│   │   ├── tasks/page.tsx       # Task list with filters
│   │   └── new/page.tsx         # Create task form
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css
├── components/
│   ├── auth/AuthProvider.tsx    # React Context for auth state
│   └── tasks/                   # TaskCard, TaskModal
├── hooks/useTasks.ts            # Task data + CRUD hook
├── lib/
│   ├── auth.ts                  # JWT sign/verify + cookie utils
│   ├── db.ts                    # MongoDB connection (singleton)
│   ├── encryption.ts            # AES-256 encrypt/decrypt
│   ├── response.ts              # Structured API response helpers
│   └── validations.ts           # Zod schemas
├── middleware.ts                # Route protection
└── models/
    ├── User.ts                  # Mongoose User model
    └── Task.ts                  # Mongoose Task model
```

---

## 🛡️ Security Implementation

| Feature | Implementation |
|---|---|
| Password hashing | `bcryptjs` with 12 salt rounds |
| Authentication | JWT stored in **HTTP-only cookies** (not localStorage) |
| Cookie flags | `HttpOnly`, `Secure` (in production), `SameSite=lax` |
| Payload encryption | Task descriptions encrypted with **AES-256** via `crypto-js` |
| Input validation | Zod schemas on every endpoint |
| Authorization | All task endpoints verify `userId === token.userId` |
| Injection prevention | Mongoose ODM parameterizes all queries; regex search is escaped |
| Env variables | All secrets in `.env.local`, never hardcoded |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/anchal-7166/task_management.git
cd task_management

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp  .env.local
# Edit .env.local with your values

# 4. Run in development
npm run dev
# App is at http://localhost:3000

```

### Environment Variables

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-character-encryption-key!!
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```


### Auth Endpoints

#### POST `/api/auth/register`
```json
// Request
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass1"
}

// Response 201
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "664abc123...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2024-06-01T10:00:00.000Z"
    }
  }
}
```

#### POST `/api/auth/login`
```json
// Request
{ "email": "jane@example.com", "password": "SecurePass1" }

// Response 200
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { ... } }
}
// Sets auth_token cookie (HTTP-only)
```

#### POST `/api/auth/logout`
```json
// Response 200
{ "success": true, "message": "Logged out successfully", "data": null }
// Clears auth_token cookie
```

#### GET `/api/auth/me`
```json
// Response 200 (requires auth cookie)
{
  "success": true,
  "data": { "user": { "id": "...", "name": "...", "email": "..." } }
}
```

---

### Task Endpoints (all require auth)

#### GET `/api/tasks`

Query params: `page`, `limit`, `status`, `priority`, `search`, `sortBy`, `sortOrder`

```
GET /api/tasks?page=1&limit=10&status=todo&search=meeting&sortBy=createdAt&sortOrder=desc
```

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "664abc...",
      "title": "Team meeting prep",
      "description": "Prepare agenda and slides",
      "status": "todo",
      "priority": "high",
      "dueDate": "2024-06-10T00:00:00.000Z",
      "userId": "664def...",
      "createdAt": "2024-06-01T10:00:00.000Z",
      "updatedAt": "2024-06-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### POST `/api/tasks`
```json
// Request
{
  "title": "Review PR",
  "description": "Check the authentication PR on GitHub",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-06-15T00:00:00.000Z"
}

// Response 201
{ "success": true, "message": "Task created successfully", "data": { "_id": "...", ... } }
```

#### GET `/api/tasks/:id`
```json
// Response 200
{ "success": true, "data": { "_id": "...", "title": "...", ... } }

// Error 403 (accessing another user's task)
{ "success": false, "error": "You do not have access to this task" }
```

#### PUT `/api/tasks/:id`
```json
// Request (all fields optional)
{ "status": "done", "priority": "low" }

// Response 200
{ "success": true, "message": "Task updated successfully", "data": { ... } }
```

#### DELETE `/api/tasks/:id`
```json
// Response 200
{ "success": true, "message": "Task deleted successfully", "data": null }
```

---

## 🗄️ Database Design

### User Collection
```
_id, name, email (indexed, unique), password (bcrypt, hidden), createdAt, updatedAt
```

### Task Collection
```
_id, title, description (AES-256 encrypted), status (indexed), priority (indexed),
userId (indexed, ref: User), dueDate, createdAt, updatedAt
```

---

## 🧪 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + HTTP-only cookies |
| Encryption | AES-256 (crypto-js) |
| Password hashing | bcryptjs (12 rounds) |
| Validation | Zod |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
