import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/ProjectReg.css";
import { setMessage } from '../redux/authslice';

const ProjectReg = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    company: "",
    deadline: "",
  });
  const [rows, setRows] = useState([{ name: "", email: "", role: "developer" }]);
  const status = "planning";
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { name: "", email: "", role: "developer" }]);
  };

  const deleteRow = (index) => {
    if (rows.length === 1) {
      dispatch(setMessage({ type: 'error', text: "At least one member slot is mandatory." }));
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      dispatch(setMessage({ type: 'error', text: "Please log in to register a project." }));
      navigate("/login");
      return;
    }

    const { title, description, company, deadline } = form;

    if (!title || !description || !company || !deadline) {
      dispatch(setMessage({ type: 'error', text: "All fields are required." }));
      return;
    }

    const membersToSend = rows
      .filter((m) => m.email.trim())
      .map((m) => ({
        name: m.name.trim(),
        email: m.email.trim(),
        role: m.role.trim() || "developer",
      }));

    const payload = {
      title,
      description,
      company,
      deadline,
      members: membersToSend,
      progress: 0,
      status,
    };

    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to register project");

      dispatch(setMessage({ type: 'success', text: "Project registered successfully!" }));
      navigate("/projectspage");
    } catch (err) {
      console.error("Error creating project:", err);
      dispatch(setMessage({ type: 'error', text: err.message || "Something went wrong." }));
    }
  };

  return (
    <div className="project-container">
      <form className="project-form" onSubmit={handleSubmit}>
        <h2 className="title">Project Registration</h2>

        <div className="input-group">
          <label>Project Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g: Project X"
            required
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Give a brief note"
            required
          />
        </div>

        <div className="input-group">
          <label>Company</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="e.g: Astra"
            required
          />
        </div>

        <div className="input-group">
          <label>Deadline</label>
          <input
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            placeholder="e.g: 25/12/2025"
            required
          />
        </div>

        <div className="input-group">
          <label>Project Status</label>
          <input
            type="text"
            value={status}
            readOnly
            className="status-field"
          />
        </div>

        <div className="member-header">
          <h3>Add Members (you’ll be auto-added as Admin)</h3>
          <button type="button" onClick={addRow} className="add-btn">
            + Add Row
          </button>
        </div>

        <table className="member-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      handleMemberChange(i, "name", e.target.value)
                    }
                    placeholder="Enter name"
                  />
                </td>
                <td>
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) =>
                      handleMemberChange(i, "email", e.target.value)
                    }
                    placeholder="Enter email"
                  />
                </td>
                <td>
                  <select
                    value={row.role}
                    onChange={(e) =>
                      handleMemberChange(i, "role", e.target.value)
                    }
                  >
                    <option value="lead">lead</option>
                    <option value="designer">designer</option>
                    <option value="developer">developer</option>
                    <option value="tester">tester</option>
                    <option value="analyst">analyst</option>
                    <option value="architect">architect</option>
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => deleteRow(i)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Register Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectReg;