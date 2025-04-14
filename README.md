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

