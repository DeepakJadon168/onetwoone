import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/one-to-one-logo.jpg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-logo-chip">
            <img src={logo} alt="One To One Car & Bike Rental" />
          </span>
        </Link>

        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={`nav-links ${menuOpen ? "mobile-open" : ""}`}>
          <Link to="/" onClick={closeMenu}>Vehicles</Link>
          {user && <Link to="/my-bookings" onClick={closeMenu}>My Bookings</Link>}
          {user && <Link to="/wishlist" onClick={closeMenu}>Wishlist</Link>}
          {user && <Link to="/support" onClick={closeMenu}>Support</Link>}
          {user?.role === "admin" && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
          {!user && <Link to="/login" onClick={closeMenu}>Login</Link>}
          {!user && <Link to="/register" className="btn-nav" onClick={closeMenu}>Sign Up</Link>}
          {user && (
            <button onClick={handleLogout} className="btn-nav-outline">
              Logout ({user.name.split(" ")[0]})
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
