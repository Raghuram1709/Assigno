# Assingo Backend

## Setup
1. Run `npm install` to install dependencies.
2. Create a .env file (copy from .env.example) and fill in values:
- PORT=4000
- MONGODB_URI=your_mongo_url
- JWT_SECRET=your_jwt_secret
3. Run `npm run dev` for development.

## API Endpoints
- POST /api/auth/register: Register a user.
- POST /api/auth/login: Login and get JWT token.
- GET /api/projects: Get user's projects.
- POST /api/projects: Create a project.
- And more... (see routes/projects.js for full list).