import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authslice";
import { Sling as Hamburger } from "hamburger-react";
import "../styles/navbar.css";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCloseMenu = () => setIsOpen(false);

  const handleLogout = () => {
    dispatch(logout());
    handleCloseMenu();
    navigate('/login');
  };

  return (
    <div className="nav-grid">
      <div className="navbar">
        <Link to="/">
          <h1>Assingo</h1>
        </Link>
        <Hamburger toggled={isOpen} toggle={setIsOpen} />
      </div>

      {isOpen && (
        <div className="link-slide" ref={menuRef}>
          {!isAuthenticated ? (
            <>
              <li><Link to="/login" onClick={handleCloseMenu}>Login</Link></li>
              <li><Link to="/signup" onClick={handleCloseMenu}>Signup</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/profilepage" onClick={handleCloseMenu}>Profile</Link></li>
              <li><Link to="/projectspage" onClick={handleCloseMenu}>Projects</Link></li>
              <li><Link to="/aboutus" onClick={handleCloseMenu}>About Us</Link></li>
              <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Logout</button></li>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NavBar;