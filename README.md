# Client Authentication and Management Demo System log in page

## Project Overview

This project demonstrates a secure client authentication and session management system. It is a full-stack development exercise to showcase the following features:
- **Sign Up**: Allows clients to create an account by providing their name, email, and password.
- **Log In**: Enables clients to access the system using their email and password.
- **Session Management**: Implements session expiration to keep clients logged in for 24 hours after their last access.
- **Security**: Ensures that passwords are securely hashed, preventing developers from accessing plaintext passwords.
- **CRUD Operations**: Supports creating, reading, updating, and deleting client information through API endpoints.
- **User-Friendly**: Designed with a simple and intuitive interface for both functionality and demo purposes.

The system includes:
1. **Frontend**: Built with TypeScript.
2. **Backend**: Uses Python with FastAPI.
3. **Database**: SQL schema implemented in Supabase.

---

## Technologies and Libraries

### Frontend
| Technology/Library | Version | Purpose |
|-------------------|---------|---------|
| **React** | 18.x | Core UI library for building component-based interfaces |
| **TypeScript** | 4.x | Static typing for JavaScript to improve code quality and maintainability |
| **React Router** | 6.x | Declarative routing for React applications with support for nested routes |
| **Framer Motion** | 6.x | Animation library for creating smooth transitions between routes |
| **Axios** | 0.27.x | Promise-based HTTP client for making API requests to the backend |
| **localStorage API** | Browser API | Client-side storage for authentication tokens |

### Backend
| Technology/Library | Version | Purpose |
|-------------------|---------|---------|
| **Python** | 3.9+ | Core programming language for the backend |
| **FastAPI** | 0.78.x | High-performance web framework for building APIs with automatic documentation |
| **SQLAlchemy** | 1.4.x | SQL toolkit and ORM for database interaction |
| **Pydantic** | 1.9.x | Data validation and settings management using Python type annotations |
| **Bcrypt** | 3.2.x | Password hashing library for secure credential storage |
| **PyJWT** | 2.4.x | JSON Web Token implementation for secure authentication |
| **Uvicorn** | 0.17.x | ASGI server for running the FastAPI application |
| **Python-multipart** | 0.0.5+ | Support for form data parsing |

### Database
| Technology/Library | Version | Purpose |
|-------------------|---------|---------|
| **Supabase** | Cloud Service | PostgreSQL database with added features for authentication and real-time subscriptions |
| **PostgreSQL** | 14.x | Relational database system for structured data storage |

### Development Tools
| Technology/Library | Version | Purpose |
|-------------------|---------|---------|
| **npm/yarn** | Latest | Package management for frontend dependencies |
| **pip** | Latest | Package management for Python dependencies |
| **ESLint** | 8.x | JavaScript/TypeScript linting for code quality |
| **Prettier** | 2.x | Code formatting to maintain consistent style |
| **pytest** | 7.x | Testing framework for backend code |
| **Postman** | Latest | API testing and documentation tool |

### Rationale for Technology Choices

- **React & TypeScript**: Chosen for their strong ecosystem, type safety, and component reusability, enabling faster development with fewer runtime errors.
- **FastAPI**: Selected for its performance, automatic documentation generation (via OpenAPI), and native support for Python type hints.
- **Framer Motion**: Implemented to create smooth page transitions that enhance the user experience when navigating the application.
- **Supabase**: Utilized as a scalable PostgreSQL database service with built-in authentication features, reducing the need for custom infrastructure.
- **JWT Authentication**: Adopted for its stateless nature, making it ideal for scalable applications while maintaining security.
- **Bcrypt**: Employed for its security-focused approach to password hashing, offering protection against brute force attacks.
- **Axios**: Preferred over fetch for its more comprehensive API, automatic JSON transformation, and request/response interception capabilities.

---

## Integration Guide

This authentication system is designed to be modular and can be integrated into larger projects. Here's how to incorporate it into your existing application:

### Frontend Integration

1. **As a Sub-Router**:
   - Import the `AnimatedRoutes` component from `App.tsx` instead of using the entire `App` component
   - Mount it under a specific path in your main application router
   ```jsx
   // In your main app router
   <Routes>
     <Route path="/auth/*" element={<AnimatedRoutes />} />
     <Route path="/dashboard" element={<Dashboard />} />
     {/* Your other routes */}
   </Routes>
   ```

2. **Authentication Service**:
   - Update the `API_URL` in `services/auth.ts` to match your production environment
   - The `authService` can be extended to include additional authentication methods or integrated with your existing auth system
   - You can modify the token storage mechanism to use your preferred state management solution (Redux, Context API, etc.)

3. **Route Customization**:
   - Route paths in `App.tsx` can be customized to fit your application's URL structure
   - The protected route component can be extended to handle different user roles and permissions

### Backend Integration

1. **API Endpoints**:
   - The FastAPI backend can be mounted as a sub-application in a larger FastAPI project using the `APIRouter`
   ```python
   from fastapi import FastAPI, APIRouter
   from auth_app.main import app as auth_app

   main_app = FastAPI()
   auth_router = APIRouter()
   auth_router.include_router(auth_app, prefix="/auth")
   main_app.include_router(auth_router)
   ```

2. **Database Integration**:
   - Ensure the database tables (Clients, Authentication, Sessions) exist in your main database
   - If using different table names, update the corresponding models and queries in the backend code

3. **Authentication Middleware**:
   - The token verification middleware can be reused across your application to protect other endpoints
   - You may need to adapt the middleware to work with your existing user role system

### Environment Configuration

1. **Environment Variables**:
   - Update the following variables in both frontend and backend:
     - API URLs
     - Database connection strings
     - JWT secret keys
     - Session expiration times

2. **CORS Settings**:
   - Adjust CORS settings in the backend to allow requests from your frontend domains

---

## Database Schema

### Clients Table
**Purpose**: Stores basic client information.
- **Columns**:
  - `id`: Auto-generated unique identifier for each client.
  - `client_name`: Name of the client.
  - `email`: Email address of the client.
  - `created_at`: Timestamp when the client record was created.
  - `update_at`: Timestamp of the last update to the client record.

---

### Authentication Table
**Purpose**: Manages client authentication details.
- **Columns**:
  - `auth_id`: Auto-generated unique identifier for each authentication record.
  - `password_hash`: Hashed password for secure storage.
  - `last_login`: Timestamp of the last successful login.
  - `updated_at`: Timestamp of the last update to the authentication record.
  - `client_id`: Foreign key linking to the `Clients` table.

---

### Sessions Table
**Purpose**: Tracks client sessions to manage time-limited access.
- **Columns**:
  - `session_id`: Unique identifier for each session.
  - `client_id`: Foreign key linking to the `Clients` table.
  - `created_at`: Timestamp when the session was created.
  - `expires_at`: Timestamp when the session expires (24 hours after creation).
  - `last_activity`: Timestamp of the last activity in the session.

---

## Features

### 1. Sign-Up
Clients can sign up using their name, email, and password. Upon signup:
- A new entry is added to the `Clients` table.
- A hashed password is stored in the `Authentication` table.
- The system validates the email for uniqueness.

### 2. Log-In
Clients log in with their email and password. Upon successful login:
- Their credentials are validated against the `Authentication` table.
- A session is created in the `Sessions` table, with a 24-hour expiration.

### 3. Session Management
Sessions are handled securely:
- If a client logs in again within 24 hours, the existing session is updated.
- After 24 hours of inactivity, clients are logged out automatically.

### 4. CRUD Operations
API endpoints provide full control over client data:
- **Create**: Add new clients.
- **Read**: Fetch client details.
- **Update**: Modify client information.
- **Delete**: Remove clients and associated records.

---

## Security Considerations
1. **Password Hashing**: Uses `bcrypt` to securely hash passwords before storage.
2. **Session Expiration**: Prevents indefinite access by implementing time-limited sessions.
3. **Data Isolation**: Separates authentication and session data from client profiles.
4. **Secure API Endpoints**:
   - HTTPS should be used for communication.
   - Token-based authentication (e.g., JWT) secures API access.

---

## Setup Instructions

### 1. Database Setup
- Import the provided SQL schema into Supabase.
- Ensure the database is connected to your FastAPI backend.

### 2. Backend Setup
- Install Python dependencies:
  ```bash
  pip install fastapi bcrypt uvicorn sqlalchemy
  ```
- Start the FastAPI server:
  ```bash
  uvicorn main:app --reload
  ```

### 3. Frontend Setup
- Install TypeScript dependencies:
  ```bash
  npm install
  ```
- Start the frontend development server:
  ```bash
  npm start
  ```

### 4. Testing
- Use tools like Postman to test API endpoints.
- Ensure the signup, login, and session management functionalities work as expected.

---

## API Endpoints

### Authentication
1. **POST /signup**  
   - **Purpose**: Register a new client.  
   - **Input**: `name`, `email`, `password`.  
   - **Response**: Success message and client details.  

2. **POST /login**  
   - **Purpose**: Authenticate a client.  
   - **Input**: `email`, `password`.  
   - **Response**: Session details (e.g., `session_id`, `expires_at`).  

3. **POST /logout**  
   - **Purpose**: Invalidate the current session.  

---

### Clients Management
1. **GET /clients**  
   - **Purpose**: Retrieve all clients.  

2. **PUT /clients/{id}**  
   - **Purpose**: Update client details.  

3. **DELETE /clients/{id}**  
   - **Purpose**: Delete a client.  

---

## Future Enhancements
- **Frontend Improvements**: Add a polished UI for signup and login.
- **Scalability**: Integrate caching or distributed session management.
- **Analytics**: Track login trends for better insights.

