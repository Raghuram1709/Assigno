const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getProjects,
  createProject,
  getProjectById,
  assignProject,
  assignTasks,
  submitRequest,
  getRequests,
  approveRequest,
  rejectRequest,
  submitProject,
  getPendingProjects,
  approveProject
} = require('../controllers/projectController');

const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();
router.use(authMiddleware);

// ---------------- MULTER CONFIG ----------------
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs and images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ---------------- ROUTES ----------------

// Admin routes
router.get('/pending', getPendingProjects);
router.post('/:id/approve', approveProject);

// Project routes
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.post('/:id/assign', assignProject);
router.post('/:id/tasks', assignTasks);

// ✅ smart handling for requests – only run multer if it’s multipart
router.post('/:id/requests', (req, res, next) => {
  const contentType = req.headers['content-type'];
  if (contentType && contentType.includes('multipart/form-data')) {
    upload.single('proofFile')(req, res, next);
  } else {
    next(); // skip multer for text-only requests
  }
}, submitRequest);

// file upload for report
router.post('/:id/submit', upload.single('reportFile'), submitProject);

// Misc routes
router.get('/:id/requests', getRequests);
router.post('/:id/approve-request', approveRequest);
router.post('/:id/reject', rejectRequest);

module.exports = router;
