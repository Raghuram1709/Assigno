import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessage } from "../redux/authslice";

const User = ({ project, setProject }) => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!user) return <p>User data not found. Please log in.</p>;

  const currentUser = project.members.find((m) => m.email === user.email);
  const [form, setForm] = useState({
    taskName: "",
    description: "",
    proofLink: "",
    file: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") setForm({ ...form, file: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.taskName.trim() ||
      !form.description.trim() ||
      (!form.proofLink && !form.file)
    ) {
      dispatch(
        setMessage({
          type: "error",
          text: "Task Name, Description, and Proof (link or file) are required.",
        })
      );
      return;
    }

    if (!token) {
      dispatch(
        setMessage({ type: "error", text: "Authentication token missing." })
      );
      return;
    }

    const matchedTask = currentUser?.tasks?.find(
      (t) =>
        t.title.trim().toLowerCase() === form.taskName.trim().toLowerCase()
    );

    if (!matchedTask) {
      dispatch(
        setMessage({
          type: "error",
          text: "Task not found in your assigned tasks. Please check the task name.",
        })
      );
      return;
    }

    const formData = new FormData();
    formData.append("taskId", matchedTask._id);
    formData.append("description", form.description.trim());
    if (form.file) formData.append("proofFile", form.file);
    if (form.proofLink) formData.append("proofLink", form.proofLink);

    try {
      setSubmitting(true);
      const res = await fetch(
        `http://localhost:5000/api/projects/${project._id}/requests`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit request");
      }

      const updatedMembers = project.members.map((m) => {
        if (m.email === user.email) {
          const updatedTasks = m.tasks.map((t) =>
            t._id === matchedTask._id ? { ...t, status: "submitted" } : t
          );
          return { ...m, tasks: updatedTasks };
        }
        return m;
      });

      setProject({ ...project, members: updatedMembers });
      dispatch(
        setMessage({ type: "success", text: "Request submitted successfully!" })
      );
      setForm({ taskName: "", description: "", proofLink: "", file: null });
    } catch (err) {
      console.error("Error submitting request:", err);
      dispatch(
        setMessage({
          type: "error",
          text: err.message || "Something went wrong while submitting.",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) return <p>User data not found in this project.</p>;
  if (project.status !== "in-progress") {
    return (
      <p>
        Requests can only be submitted when the project is in "in-progress"
        status.
      </p>
    );
  }

  // ✅ NEW: Stop showing tasks or submission form when user progress is 100%
  if (currentUser.progress >= 100) {
    return (
      <div className="user-dashboard">
        <h2>Your Project Role: {currentUser.role.toUpperCase()}</h2>
        <div className="user-info">
          <p>
            <strong>Name:</strong> {currentUser.name}
          </p>
          <p>
            <strong>Your Current Progress:</strong> {currentUser.progress}%
          </p>
          <p className="completion-message">
            🎉 All your assigned tasks are completed and approved. Sit back and relax.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <h2>Your Project Role: {currentUser.role.toUpperCase()}</h2>
      <div className="user-info">
        <p>
          <strong>Name:</strong> {currentUser.name}
        </p>
        <p>
          <strong>Your Current Progress:</strong> {currentUser.progress || 0}%
        </p>
        <h3>Your Assigned Tasks</h3>
        {currentUser.tasks && currentUser.tasks.length > 0 ? (
          <ul className="tasks-list">
            {currentUser.tasks.map((task, i) => (
              <li key={i} className={`task-item status-${task.status}`}>
                <p>
                  <strong>Task:</strong> {task.title}
                </p>
                <p>
                  <strong>Deadline:</strong> {task.deadline || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {task.status.toUpperCase()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks assigned yet.</p>
        )}
      </div>

      <div className="progress-update">
        <h3>Submit Progress for a Task</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Name (must match assigned task)</label>
            <input
              type="text"
              name="taskName"
              value={form.taskName}
              onChange={handleChange}
              placeholder="Enter the task name"
              required
            />
          </div>
          <div className="form-group">
            <label>Proof (Upload File or Paste Link)</label>
            <input
              type="file"
              name="file"
              accept=".pdf,.jpg,.png,.jpeg"
              onChange={handleChange}
            />
            <input
              type="text"
              name="proofLink"
              value={form.proofLink}
              onChange={handleChange}
              placeholder="Or paste link here"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Explain what you did..."
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default User;
