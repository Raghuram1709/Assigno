const Project = require('../models/Project');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Configure multer
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ---------------- GET PROJECTS ----------------
exports.getProjects = async (req, res) => {
  try {
    if (!req.user?.email) return res.status(401).json({ message: 'Unauthorized' });
    const projects = await Project.find({ 'members.email': req.user.email });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- CREATE PROJECT ----------------
exports.createProject = async (req, res) => {
  const { title, description, company, deadline, members } = req.body;
  try {
    await Promise.all(
      members.map(async m => {
        const existingUser = await User.findOne({ email: m.email });
        if (!existingUser)
          throw new Error(`User with email ${m.email} does not exist. Only registered users can be added.`);
      })
    );

    const creator = await User.findById(req.user.id);
    const projectMembers = [
      { name: creator.name, email: creator.email, role: 'admin', progress: 0 },
      ...members.map(m => ({ ...m, role: m.role || 'developer', progress: 0 })),
    ];

    const project = new Project({
      title,
      description,
      company,
      deadline,
      members: projectMembers,
      status: 'planning',
      createdBy: req.user.id,
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- GET PROJECT BY ID ----------------
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- ASSIGN PROJECT ----------------
exports.assignProject = async (req, res) => {
  const { members, status } = req.body;
  try {
    if (status !== 'in-progress') return res.status(400).json({ message: 'Invalid status' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const admin = project.members.find(m => m.role === 'admin');
    const updatedMembers = [...new Map([...members, admin].map(m => [m.email, m])).values()];

    project.members = updatedMembers;
    project.status = 'in-progress';
    await project.save();

    res.json({ message: 'Project assigned successfully', project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- ASSIGN TASKS ----------------
exports.assignTasks = async (req, res) => {
  const { email, tasks } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.email === email);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.tasks.push(...tasks);
    await project.save();
    res.json({ message: 'Tasks assigned' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- SUBMIT REQUEST ----------------
exports.submitRequest = async (req, res) => {
  const { taskId, description, proofLink } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.status !== 'in-progress')
      return res.status(404).json({ message: 'Project not found or not in progress' });

    const member = project.members.find(m => m.email === req.user.email);
    if (!member) return res.status(403).json({ message: 'Not a member of this project' });

    const task = member.tasks.find(t => t._id.toString() === taskId);
    if (!task) return res.status(400).json({ message: 'Task not found' });

    let proof = proofLink || '';
    if (req.file) proof = `/uploads/${req.file.filename}`;

    task.status = 'submitted';
    task.proof = proof;

    project.requests.push({
      userEmail: req.user.email,
      taskId: task._id.toString(),
      taskTitle: task.title,
      proof,
      description,
      status: 'pending',
    });

    await project.save();
    res.json({ message: 'Request submitted' });
  } catch (err) {
    console.error('Error in submitRequest:', err);
    res.status(500).json({ message: err.message });
  }
};


// ---------------- GET REQUESTS ----------------
exports.getRequests = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const pending = project.requests.filter(r => r.status === 'pending');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- APPROVE REQUEST (Leader & Admin Shared Logic) ----------------
exports.approveRequest = async (req, res) => {
  const { userEmail, taskId } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const request = project.requests.find(r =>
      taskId
        ? r.taskId === taskId
        : r.userEmail === userEmail && r.taskTitle === 'Final Project Submission'
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status === 'approved')
      return res.status(400).json({ message: 'Request already approved' });

    request.status = 'approved';

    if (request.role === 'leader' && request.taskTitle === 'Final Project Submission') {
      project.status = 'submitted';
      project.reportLink = request.proof;
    } else {
      const member = project.members.find(m => m.email === userEmail);
      const task = member?.tasks.find(t => t._id.toString() === taskId);
      if (task) {
        task.status = 'approved';
        const taskProgress = Number(task.progress) || 0;
        member.progress = Math.min((member.progress || 0) + taskProgress, 100);
      }

      const validMembers = project.members.filter(m => m.role !== 'admin' && m.role !== 'lead');
      project.progress = validMembers.length
        ? validMembers.reduce((sum, m) => sum + (m.progress || 0), 0) / validMembers.length
        : 0;
    }

    await project.save();
    res.json({
      message: 'Request approved successfully',
      updatedRequests: project.requests.filter(r => r.status !== 'approved'),
      project,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- REJECT REQUEST ----------------
exports.rejectRequest = async (req, res) => {
  const { userEmail, taskId } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const request = project.requests.find(r => r.taskId === taskId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'rejected';

    const member = project.members.find(m => m.email === userEmail);
    const task = member?.tasks.find(t => t._id.toString() === taskId);
    if (task) task.status = 'rejected';

    await project.save();
    res.json({ message: 'Rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitProject = async (req, res) => {
  const { reportLink } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const lead = project.members.find(
      (m) => m.email === req.user.email && m.role === "lead"
    );
    if (!lead)
      return res.status(403).json({ message: "Only the lead can submit the final project" });

    // Don't set project.status yet, let admin approve later
    const finalRequest = {
      userEmail: req.user.email,
      taskId: `final_submission_${Date.now()}`,
      taskTitle: "Final Project Submission",
      proof: reportLink,
      description: "Leader submitted final project report for admin approval",
      status: "pending",
      role: "lead",
    };

    project.requests.push(finalRequest);
    await project.save();

    res.json({ message: "Final project submitted for admin approval!" });
  } catch (err) {
    console.error("Error submitting project:", err);
    res.status(500).json({ message: err.message });
  }
};





// ---------------- GET PENDING PROJECTS ----------------
exports.getPendingProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "requests.role": "lead",
      "requests.status": "pending"
    });

    if (!projects.length) {
      return res.status(404).json({ message: "No pending projects for approval." });
    }

    // Format for frontend clarity
    const formatted = projects.map(p => {
      const leadReq = p.requests.find(r => r.role === "lead" && r.status === "pending");
      return {
        _id: p._id,
        title: p.title,
        status: p.status,
        proof: leadReq?.proof,
        description: leadReq?.description,
        leadEmail: leadReq?.userEmail,
      };
    });

    res.status(200).json({
      message: "Pending projects fetched successfully",
      count: formatted.length,
      projects: formatted
    });
  } catch (err) {
    console.error("Error fetching pending projects:", err);
    res.status(500).json({ message: "Server error fetching pending projects" });
  }
};

// ---------------- APPROVE PROJECT ----------------
exports.approveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Update lead request status
    const leadReq = project.requests.find(r => r.role === "lead" && r.status === "pending");
    if (!leadReq) {
      return res.status(400).json({ message: "No pending lead request found for this project" });
    }

    leadReq.status = "approved";
    project.status = "completed";
    project.progress = 100;

    await project.save();

    res.status(200).json({
      message: "Project approved successfully by Admin",
      project
    });
  } catch (err) {
    console.error("Error approving project:", err);
    res.status(500).json({ message: "Server error approving project" });
  }
};
