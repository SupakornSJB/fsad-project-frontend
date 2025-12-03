import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <p className="eyebrow">Field Service & Assessment Dashboard</p>
            <h1 className="hero-title">Community challenges resolved together.</h1>
            <p className="hero-subtitle">
              Submit issues, collaborate on solutions, and celebrate progress on a platform built for
              transparent community problem solving. Measure momentum, spot trends, and keep stakeholders in
              the loop from day one.
            </p>
            <div className="hero-actions">
              {user ? (
                <>
                  <Link className="btn btn-primary" to="/reports">
                    Go to your workspace
                  </Link>
                  <Link className="btn btn-ghost" to="/profile">
                    View profile
                  </Link>
                </>
              ) : (
                <>
                  <Link className="btn btn-primary" to="/register">
                    Create an account
                  </Link>
                  <Link className="btn btn-ghost" to="/login">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container page-stack" style={{ paddingTop: '3rem' }}>
        <div className="section-header">
          <div>
            <h2>Bring clarity to community projects</h2>
            <p className="section-subtitle">
              UPTS centralizes field issues, conversations, and resolutions so teams can move from report to
              results without dropping context.
            </p>
          </div>
          <Link className="btn btn-secondary" to={user ? '/reports' : '/register'}>
            {user ? 'Open Reports' : 'Get Started'}
          </Link>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Ready to make impact visible?</h2>
          <p style={{ color: 'var(--color-muted)' }}>
            Connect frontline insights with decision makers. Empower contributors to add solutions, vote on
            priorities, and showcase the work that matters most.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <Link className="btn btn-primary" to={user ? '/reports' : '/register'}>
              {user ? 'Jump back in' : 'Join the workspace'}
            </Link>
            {!user && (
              <Link className="btn btn-ghost" to="/login">
                I already have an account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
