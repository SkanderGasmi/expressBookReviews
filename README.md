# 📚 Book Review API - RESTful Backend Service

A professional-grade RESTful API for managing book reviews with JWT authentication, built with Node.js and Express.js. This application provides a complete backend solution for an online book review platform.

## 🚀 Features

- **🔐 JWT Authentication** - Secure user authentication with JSON Web Tokens
- **📖 CRUD Operations** - Full Create, Read, Update, Delete functionality for book reviews
- **🔍 Advanced Search** - Search books by ISBN, author, or title
- **👥 User Management** - User registration, login, and session management
- **💬 Review System** - Users can add, modify, and delete their own reviews
- **⚡ Async/Await** - Modern asynchronous programming patterns
- **🛡️ Security** - Input validation, session management, and secure headers
- **📊 Structured Responses** - Consistent JSON response format

## 🏗️ Architecture

```

expressBookReviews/
├── final_project/
│   ├── index.js              # Main application entry point
│   ├── package.json          # Dependencies and scripts
│   ├── .env                  # Environment variables
│   └── router/               # Route handlers
│       ├── booksdb.js        # In-memory book database
│       ├── general.js        # Public routes
│       └── auth_users.js     # Authenticated routes

````

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Git
- PowerShell (Windows) or Terminal (macOS/Linux)

## 🛠️ Installation

### Option 1: Quick Start (Windows PowerShell)

```powershell
# Clone the repository
git clone <your-repo-url>
cd expressBookReviews\final_project

# Run setup script
.\setup.ps1
````

### Option 2: Manual Setup

```bash
# Navigate to project directory
cd expressBookReviews/final_project

# Install dependencies
npm install

# Create environment file
echo "PORT=5000" > .env
echo "SESSION_SECRET=your_session_secret" >> .env
echo "JWT_SECRET=your_jwt_secret" >> .env

# Start the server
npm run dev
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
SESSION_SECRET=your_session_secret_here
JWT_SECRET=your_jwt_secret_here
```

## 🚀 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Health Check

```bash
curl http://localhost:5000/health
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000
```

### Authentication

All authenticated endpoints require a JWT token obtained through login.

### Public Endpoints (No Authentication Required)

| Method | Endpoint          | Description            |
| ------ | ----------------- | ---------------------- |
| GET    | `/`               | Get all books          |
| GET    | `/isbn/:isbn`     | Get book by ISBN       |
| GET    | `/author/:author` | Search books by author |
| GET    | `/title/:title`   | Search books by title  |
| GET    | `/review/:isbn`   | Get reviews for a book |
| POST   | `/register`       | Register new user      |
| GET    | `/health`         | Service health check   |
| GET    | `/api-docs`       | API documentation      |

### Authenticated Endpoints (Require Login)

| Method | Endpoint                      | Description       |
| ------ | ----------------------------- | ----------------- |
| POST   | `/customer/login`             | User login        |
| PUT    | `/customer/auth/review/:isbn` | Add/update review |
| DELETE | `/customer/auth/review/:isbn` | Delete review     |
| GET    | `/customer/auth/profile`      | Get user profile  |

## 🔧 API Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"securepass123"}'
```

### User Login

```bash
curl -X POST http://localhost:5000/customer/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"securepass123"}' \
  -c cookies.txt
```

### Add a Book Review

```bash
curl -X PUT http://localhost:5000/customer/auth/review/1 \
  -H "Content-Type: application/json" \
  -d '{"review":"A masterpiece of modern African literature."}' \
  -b cookies.txt
```

## 🗂️ Database Schema

### Book Object

```js
{
  "isbn": "1",
  "author": "Chinua Achebe",
  "title": "Things Fall Apart",
  "reviews": {
    "username1": "Review text"
  },
  "genre": ["Fiction", "Historical"],
  "year": 1958,
  "rating": 4.5
}
```

### User Object

```js
{
  "username": "john_doe",
  "password": "hashed_password",
  "registeredAt": "2024-01-15T10:30:00.000Z"
}
```

## 🔒 Security Features

* JWT authentication
* Secure session cookies
* Input validation
* Password and username constraints
* CORS configuration
* Helmet security headers

## 🧪 Testing (Planned)

```bash
npm install --save-dev jest supertest
npm test
```

## 🚦 Error Handling

Consistent error response format with proper HTTP status codes.

## 🚀 Deployment

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Heroku

```bash
echo "web: npm start" > Procfile
git push heroku main
```

## 📄 License

MIT License

## 🙏 Acknowledgments

* IBM Full Stack Software Developer Professional Certificate
* Express.js
* JWT.io
* OpenAPI Specification

---

*Last Updated: February 10, 2026*

```
```
