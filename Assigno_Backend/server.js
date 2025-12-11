const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

dotenv.config();

// --- Connect to MongoDB ---
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// --- Ensure uploads folder exists ---
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
