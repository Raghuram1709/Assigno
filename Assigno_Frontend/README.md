# Assigno_Frontend

## SetUp
1. Run npm install to install dependencies.
2. Create a .env file (copy from .env.example) and set:
- VITE_API_URL=http://localhost:4000
3. npm run dev (or) npm start (for CRA)


## API Usage(examples)
// login
- axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  email, password
});

// fetch projects (with token)
- axios.get(`${import.meta.env.VITE_API_URL}/api/projects`, {
  headers: { Authorization: `Bearer ${token}` }
});
