import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; 
import ProgressInfo from "../Components/ProgessInfo";
import Loader from "../Components/Loader";
import AnimatedProgress from "../Components/AnimatedProgress";
import Admin from "../Components/Admin";
import Leader from "../Components/Lead";
import User from "../Components/User";
import { setMessage } from '../redux/authslice'; 

const DashBoard = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!id || !isAuthenticated || !token) {
      setError("Missing Project ID or User Authentication.");
      dispatch(setMessage({ type: 'error', text: "Please log in to access the dashboard." }));
      navigate('/login');
      return;
    }

    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Project Not Found or Unauthorized");
        const data = await res.json();
        setProject(data);

        const currentMember = data.members.find((m) => m.email === user.email);
        if (currentMember) setRole(currentMember.role?.toLowerCase());
        else setRole("guest");

       
      } catch (err) {
        console.log(err);
        setError(err.message || "Failed to load project details.");
        dispatch(setMessage({ type: 'error', text: err.message || "Failed to load project." }));
      }
    };

    fetchProject();
  }, [id, isAuthenticated, token, user, navigate, dispatch]);

  if (error) return <div className="error-message-center">Error: {error}</div>;
  if (!project) return <Loader text="Fetching Project details" />;

  const leadMember = project.members.find(m => m.role?.toLowerCase() === 'lead');

  return (
    <div className="dashboard-grid">
      <h1>{project.title}</h1>
      <div className="pro-details">
        <p><strong>Description:</strong> {project.description}</p>
        <p><strong>Company:</strong> {project.company}</p>
        <p><strong>Lead:</strong> {leadMember ? leadMember.name : "N/A"}</p>
        <p><strong>Team Size:</strong> {project.members.length}</p>
        <p><strong>Deadline:</strong> {project.deadline}</p>
        <p><strong>Status:</strong> {project.status.toUpperCase()}</p>
      </div>

      <div className="progress-details">
        <h1>Progress Overview</h1>
        <div className="progress-wrapper">
          {project.members && project.members.length > 0 ? (
            project.members.map((member) => (
              <ProgressInfo key={member._id || member.email} member={member} /> 
            ))
          ) : (
            <p>No team members found.</p>
          )}
        </div>
        <div className="avg-progress">
          <AnimatedProgress progress={project.progress} size={150} strokeWidth={15}/>
          <h1>Overall Progress</h1>
        </div>
      </div>

      <div className="user-wrapper">
        {role === "admin" ? (
          <Admin project={project} setProject={setProject} />
        ) : role === "lead" ? (
          <Leader project={project} setProject={setProject} />
        ) : (
          <User project={project} setProject={setProject} />
        )}
      </div>
    </div>
  );
};

export default DashBoard;
