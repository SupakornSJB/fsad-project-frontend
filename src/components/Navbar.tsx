import { Link, NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav-link active' : 'nav-link');

function Navbar({ user = null, onLogout = () => undefined }) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          UPTS
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          {user && (
            <NavLink to="/reports" className={navLinkClass}>
              Reports
            </NavLink>
          )}
          {user && (
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
          )}
          {user?.role?.toLowerCase() === 'admin' && (
            <>
              <NavLink to="/admin/users" className={navLinkClass}>
                Team
              </NavLink>
              <NavLink to="/admin/audit-logs" className={navLinkClass}>
                Audit Logs
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="badge">{user?.role?.toLowerCase() === 'admin' ? 'Admin' : 'Member'}</span>
              <button type="button" className="btn btn-ghost" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
