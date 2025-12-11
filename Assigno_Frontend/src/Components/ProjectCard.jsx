import { useNavigate } from 'react-router-dom';
import AnimatedProgress from './AnimatedProgress';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  

  const handleDetails = () => {
    navigate(`/dashboard/${project._id}`);
  };

  return (
      <div className="proj-card">
        <div className="details">
          <div className="titles">
            <h3>{project.title}</h3>
            <p>Company: <span>{project.company}</span></p>
          </div>
          <div>
            <AnimatedProgress
              size={50}
              strokeWidth={7}
              progress={project.progress || 0}
              color="#ff5722"
              backgroundColor="#dddddd"
              fontSize={12}
              fontColor="#222"
              duration={1500}
            />
          </div>
        </div>
        <div className="proj-info">
          <p className='status-text'>{project.status.toUpperCase()}</p>
          <button onClick={handleDetails}>Details</button>
        </div>
      </div>
  );
};

export default ProjectCard;