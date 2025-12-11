import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProjectCard from "../Components/ProjectCard";
import Loader from "../Components/Loader";
import "../styles/projectpage.css";
import { logout, setMessage } from '../redux/authslice';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      dispatch(setMessage({ type: 'error', text: "Please log in to view projects." }));
      navigate("/login");
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        dispatch(setMessage({ type: 'error', text: "Failed to fetch projects." }));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, token, navigate, dispatch]);

  if (loading) return <Loader text="Fetching your projects" />;

  return (
    <div className="project-page">
      <div className="project-header">
        <Link to="/pro_registeration">
          <button className="register-btn">Register New Project</button>
        </Link>
      </div>

      {projects.length > 0 ? (
        <div>
          <h2 style={{
            fontSize:'2rem',
            textTransform:'uppercase'
          }}>
            You have {projects.length} project{projects.length > 1 ? "s" : ""}
          </h2>
          
          <div className="projects-grid"> 
            {projects.map((proj) => (
              <ProjectCard key={proj._id} project={proj} />
            ))}
          </div>
        </div>
      ) : (
        <div className="no-projects">
          <h3>No projects found under your name.</h3>
          <p>Go ahead and register one above.</p>
        </div>
      )}
      
    </div>
  );
};

export default ProjectsPage;