import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessage } from "../redux/authslice";

const Admin = ({ project, setProject }) => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    const fetchPendingProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.projects) {
          setPendingProjects(data.projects);
        } else {
          dispatch(
            setMessage({
              type: "error",
              text: data.message || "No pending projects found.",
            })
          );
          setPendingProjects([]);
        }
      } catch (err) {
        console.error("Error fetching pending projects:", err);
        dispatch(
          setMessage({
            type: "error",
            text: "Failed to fetch pending projects.",
          })
        );
      }
    };

    fetchPendingProjects();
  }, [token, dispatch]);

  const handleApprove = async (projId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "completed" }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(setMessage({ type: "success", text: "Project marked as completed!" }));
        setPendingProjects((prev) => prev.filter((p) => p._id !== projId));

        if (project && project._id === projId) {
          setProject({ ...project, status: "completed" });
        }
      } else {
        dispatch(setMessage({ type: "error", text: data.message || "Failed to approve project." }));
      }
    } catch (err) {
      console.error("Error approving project:", err);
      dispatch(setMessage({ type: "error", text: "Something went wrong while approving." }));
    }
  };

  if (!pendingProjects.length) {
    return (
      <div className="admin-approval">
        <h3>No projects pending final approval.</h3>
      </div>
    );
  }

  return (
    <div className="admin-approval">
      <h2>Pending Projects for Final Approval</h2>

      {pendingProjects.map((p) => (
        <div key={p._id} className="pending-card">
          <h3>{p.title}</h3>
          <p>Status: {p.status.toUpperCase()}</p>

          {/* 🔍 Find the lead's pending request */}
          {p.requests &&
            p.requests
              .filter((r) => r.role === "lead" && r.status === "pending")
              .map((req, idx) => (
                <div key={idx} className="lead-request">
                  <p>
                    <strong>Lead Email:</strong> {req.userEmail}
                  </p>
                  <p>
                    <strong>Description:</strong> {req.description}
                  </p>

                  {/* ✅ Show proof — link or file */}
                  {req.proof && req.proof.startsWith("/uploads/") ? (
                    <p>
                      Proof File:{" "}
                      <a
                        href={`http://localhost:5000${req.proof}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#28a745" }}
                      >
                        View / Download
                      </a>
                    </p>
                  ) : (
                    <p>
                      Proof:{" "}
                      <a
                        href={req.proof}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#007bff" }}
                      >
                        {req.proof}
                      </a>
                    </p>
                  )}
                </div>
              ))}

          <button onClick={() => handleApprove(p._id)} className="approve-btn">
            Approve & Mark Complete
          </button>
        </div>
      ))}
    </div>
  );
};

export default Admin;
