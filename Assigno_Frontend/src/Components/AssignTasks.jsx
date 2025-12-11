import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessage } from "../redux/authslice";

const AssignTasks = ({ project, setProject }) => {
  const [selectedMember, setSelectedMember] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [progressInput, setProgressInput] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // ✅ Updated filter: exclude admin and lead
  const availableMembers = project.members.filter(
    (m) =>
      !["admin", "lead"].includes(m.role.toLowerCase()) &&
      (!m.tasks || m.tasks.length === 0)
  );

  // ✅ Only show when project is in planning phase
  if (project.status !== "planning") return null;

  const handleAssign = async (e) => {
    e.preventDefault();

    if (
      !selectedMember ||
      !taskInput.trim() ||
      !progressInput.trim() ||
      !deadlineInput.trim()
    ) {
      dispatch(setMessage({ type: "error", text: "All fields are required." }));
      return;
    }

    const tasks = taskInput.split(",").map((t) => t.trim());
    const progresses = progressInput.split(",").map((p) => Number(p.trim()) || 0);
    const deadlines = deadlineInput.split(",").map((d) => d.trim());

    if (tasks.length !== progresses.length || tasks.length !== deadlines.length) {
      dispatch(
        setMessage({
          type: "error",
          text: "Tasks, progress, and deadlines must have matching counts.",
        })
      );
      return;
    }

    const newTasks = tasks.map((task, i) => ({
      title: task,
      progress: progresses[i],
      deadline: deadlines[i],
      proof: "",
      status: "unsubmitted",
    }));

    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${project._id}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: selectedMember,
            tasks: newTasks,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to assign tasks.");
      }

      const updatedMembers = project.members.map((m) =>
        m.email === selectedMember
          ? { ...m, tasks: [...(m.tasks || []), ...newTasks] }
          : m
      );

      setProject({ ...project, members: updatedMembers });

      dispatch(setMessage({ type: "success", text: "Tasks assigned successfully!" }));
      setSelectedMember("");
      setTaskInput("");
      setProgressInput("");
      setDeadlineInput("");
    } catch (err) {
      console.error("Error assigning tasks:", err);
      dispatch(
        setMessage({
          type: "error",
          text: `Error: ${err.message}. Please try again.`,
        })
      );
    }
  };

  const handleLaunch = async () => {
    if (availableMembers.length > 0) {
      dispatch(
        setMessage({
          type: "error",
          text: "Assign tasks to all members before launching.",
        })
      );
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${project._id}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            members: project.members,
            status: "in-progress",
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to launch project.");
      }

      setProject({ ...project, status: "in-progress" });
      dispatch(setMessage({ type: "success", text: "Project launched successfully!" }));
    } catch (err) {
      console.error("Error launching project:", err);
      dispatch(setMessage({ type: "error", text: err.message }));
    }
  };

  return (
    <div className="assign-tasks">
      <h2>Assign Tasks (Planning Phase)</h2>
      {availableMembers.length > 0 ? (
        <>
          <div className="input-group">
            <label>Select Member</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              required
            >
              <option value="">Select member</option>
              {availableMembers.map((m, idx) => (
                <option key={idx} value={m.email}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
          <table className="assign-table">
            <thead>
              <tr>
                <th>Tasks (comma separated)</th>
                <th>Progress Allocated (%) (comma separated)</th>
                <th>Deadlines (comma separated, YYYY-MM-DD)</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="e.g., UI Design, API Integration"
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    placeholder="e.g., 30, 40"
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    placeholder="e.g., 2025-11-01, 2025-11-05"
                    required
                  />
                </td>
                <td>
                  <button onClick={handleAssign} className="assign-btn">
                    Assign
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <div>
          <p>All members have been assigned tasks.</p>
          <button onClick={handleLaunch} className="launch-btn">
            Launch Project
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignTasks;
