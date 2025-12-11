import "../styles/Loader.css";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="loader-container">
      <div className="loader-ring"></div>
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;
