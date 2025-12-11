import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessage } from "../redux/authslice";

const SubmitProject = ({ project, setProject }) => {
  const [reportLink, setReportLink] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  console.log("SubmitProject: project.progress =", project.progress, "status =", project.status);

  // Hide if not ready or already submitted/completed
  if (project.progress < 100 || ["submitted", "completed"].includes(project.status)) {
    console.log("SubmitProject: Hiding component");
    return null;
  }

  const handleFileChange = (e) => {
    setReportFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!reportLink.trim() && !reportFile) {
      dispatch(
        setMessage({
          type: "error",
          text: "Please provide a report link or upload a file.",
        })
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("reportLink", reportLink);
      if (reportFile) formData.append("reportFile", reportFile);

      const res = await fetch(
        `http://localhost:5000/api/projects/${project._id}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData, // no JSON.stringify here, since we’re sending FormData
        }
      );

      const data = await res.json();

      if (res.ok) {
        dispatch(setMessage({ type: "success", text: data.message }));

        setReportLink("");
        setReportFile(null);

        if (setProject) {
          setProject({ ...project, status: "submitted", reportLink });
        }
      } else {
        dispatch(
          setMessage({
            type: "error",
            text: data.message || "Failed to send submission request.",
          })
        );
      }
    } catch (err) {
      console.error("Error submitting project:", err);
      dispatch(
        setMessage({ type: "error", text: "Something went wrong while submitting." })
      );
    }
  };

  return (
    <div className="submit-project">
      <h3>Submit Final Project for Admin Approval</h3>

      <input
        type="text"
        placeholder="Enter project report link"
        value={reportLink}
        onChange={(e) => setReportLink(e.target.value)}
        className="input-link"
      />

      <div className="file-upload">
        <label htmlFor="reportFile">Or Upload Report File:</label>
        <input
          type="file"
          id="reportFile"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        {reportFile && <p>Selected: {reportFile.name}</p>}
      </div>

      <button onClick={handleSubmit} className="submit-btn">
        Submit for Approval
      </button>
    </div>
  );
};

export default SubmitProject;
