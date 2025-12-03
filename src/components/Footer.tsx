import { Link } from 'react-router-dom';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {year} UPTS. Built for collaborative field solutions.</span>
        <div className="nav-links" style={{ gap: '0.75rem' }}>
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/reports" className="nav-link">
            Reports
          </Link>
          <Link to="/profile" className="nav-link">
            Profile
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
