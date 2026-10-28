# FileVault — File Upload & Sharing System

A full-stack web application for secure file upload, storage, and sharing.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| File Storage | Multer (local disk) |

## Project Structure

```
FSWD_Activity/
├── backend/          # Node.js + Express API
└── frontend/         # React (Vite) app
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017)

### 1. Start MongoDB
Make sure MongoDB is running on your machine.

### 2. Start the Backend

```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:5000

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and get JWT token |
| GET | /api/auth/me | Get current user profile |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/files/upload | Upload a file |
| GET | /api/files | Get all files (supports ?q=search) |
| GET | /api/files/:id | Get file details |
| DELETE | /api/files/:id | Delete a file |
| GET | /api/files/:id/download | Download a file |

### Share
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/share/:fileId | Share file (by email or public link) |
| DELETE | /api/share/:fileId/user/:userId | Remove share access |
| GET | /api/share/link/:token | Download via public share link |
| GET | /api/share/shared-with-me | Files shared with current user |

## Features

- 🔐 User authentication (JWT)
- 📤 File upload with drag & drop
- 📥 File download
- 🔗 File sharing (by email or public link)
- 🔍 Real-time file search
- 📱 Responsive dark mode UI
- ✅ Form validation & error handling

## Environment Variables

Create `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fileShareDB
JWT_SECRET=fileShareSuperSecretKey2024
NODE_ENV=development
```
