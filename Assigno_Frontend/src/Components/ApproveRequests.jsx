import { useDispatch } from "react-redux";
import { setMessage } from "../redux/authslice";

const ApproveRequests = ({ project, setProject }) => {
  const dispatch = useDispatch();

  const pendingRequests = project.requests
    ? project.requests.filter((r) => r.status === "pending")
    : [];

  // In ApproveRequests.jsx
const handleApprove = async (req) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Missing auth token");

    // ✅ CHANGE: Use /approve-request instead of /approve
    const res = await fetch(`http://localhost:5000/api/projects/${project._id}/approve-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userEmail: req.userEmail,
        taskId: req.taskId,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to approve");

    // Update local state from backend’s response
    const updatedProject = {
      ...project,
      requests: data.updatedRequests || project.requests.filter(r => r.taskId !== req.taskId),
      members: project.members.map((m) => {
        if (m.email === req.userEmail) {
          const updatedTasks = m.tasks.map((t) =>
            t._id === req.taskId ? { ...t, status: "approved" } : t
          );
          // ✅ FIX: Use task.progress (from backend response or local task), not req.progress
          const task = updatedTasks.find(t => t._id === req.taskId);
          const taskProgress = task ? Number(task.progress) || 0 : 0;
          return {
            ...m,
            tasks: updatedTasks,
            progress: Math.min((m.progress || 0) + taskProgress, 100),
          };
        }
        return m;
      }),
    };

    // Recalculate average only for users (roles ≠ 'admin'/'lead')
    const usersOnly = updatedProject.members.filter(
      (m) => !['admin', 'lead'].includes(m.role?.toLowerCase())
    );
    updatedProject.progress = usersOnly.length
      ? usersOnly.reduce((sum, m) => sum + (m.progress || 0), 0) / usersOnly.length
      : 0;

    setProject(updatedProject);
    dispatch(setMessage({ type: "success", text: "Request approved successfully!" }));
  } catch (err) {
    console.error("Error approving request:", err);
    dispatch(setMessage({ type: "error", text: err.message || "Approval failed" }));
  }
};

  const handleReject = async (req) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing auth token");

      const res = await fetch(`http://localhost:5000/api/projects/${project._id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userEmail: req.userEmail,
          taskId: req.taskId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject");

      setProject({
        ...project,
        requests: project.requests.filter((r) => r.taskId !== req.taskId),
      });

      dispatch(setMessage({ type: "success", text: "Request rejected successfully!" }));
    } catch (err) {
      console.error("Error rejecting request:", err);
      dispatch(setMessage({ type: "error", text: err.message || "Rejection failed" }));
    }
  };

  return (
    <div className="approve-requests">
      <h2>Approve Requests</h2>
      {pendingRequests.length === 0 ? (
        <p>No pending proofs.</p>
      ) : (
        pendingRequests.map((req) => (
          <div key={req.taskId} className="request-card">
            <p><strong>User:</strong> {req.userEmail}</p>
            <p><strong>Task:</strong> {req.taskTitle}</p>
            {req.proof && (
              req.proof.startsWith("/uploads/") ? (
                <a
                  href={`http://localhost:5000${req.proof}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Proof File
                </a>
              ) : (
                <a href={req.proof} target="_blank" rel="noopener noreferrer">
                  View Proof Link
                </a>
              )
            )}
            <div className="actions">
              <button onClick={() => handleApprove(req)} className="approve-btn">
                Approve
              </button>
              <button onClick={() => handleReject(req)} className="reject-btn">
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ApproveRequests;
