import AnimatedProgress from "./AnimatedProgress";

const ProgressInfo = ({ member }) => {
  if (!member) return <p>No member data found.</p>;

  return (
    <div className="progress-info-card">
      <h3>{member.name}</h3>
      <p className="role">{member.role.toUpperCase()}</p>
      <p className="email">{member.email}</p>
      <AnimatedProgress progress={member.progress || 0} size={80} strokeWidth={10} />
    </div>
  );
};

export default ProgressInfo;