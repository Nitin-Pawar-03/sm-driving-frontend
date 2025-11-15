import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../AuthContext";

// ✅ Import your logo correctly
import SMlogo from "../images/SMlogo.png";

function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* Left: Logo image */}
      <div className="navbar-left">
        <img
          src={SMlogo}              // ✅ Correct working path
          alt="SM Motor Driving School"
          className="logo-img"
        />
      </div>

      {/* Center: Title */}
      <div className="logo-text">SM Motor Driving School</div>

      {/* Right: Menu links */}
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/contact">Contact</Link></li>

        {isLoggedIn ? (
          <>
            <li><Link to="/admin">Admin</Link></li>
            <li>
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/login">Admin</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
