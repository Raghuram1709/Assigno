import AssignTasks from "./AssignTasks";
import ApproveRequests from "./ApproveRequests";
import SubmitProject from "./SubmitProject";

const Leader = ({ project, setProject }) => {
  return (
    <div className="leader-dashboard">
      <AssignTasks project={project} setProject={setProject} />
      <ApproveRequests project={project} setProject={setProject} />
      <SubmitProject project={project} setProject={setProject} />
    </div>
  );
};

export default Leader;