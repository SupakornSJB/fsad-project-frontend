import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {useAuth, withAuthenticationRequired} from "react-oidc-context"

function LoginPage() {
  const { signinRedirect, isAuthenticated } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 if (!isAuthenticated)  {
   signinRedirect();
 }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.email, form.password, { redirectTo: from || '/reports' });
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  const from = location.state?.from?.pathname;

  return (
    <div className="container auth-page">
      <div className="auth-wrapper">
        <Link to="/" className="back-link">
          Back to home
        </Link>
        <div className="auth-card" role="form" aria-labelledby="login-title">
          <h2 id="login-title">Welcome back</h2>
          <p>Sign in to continue reporting progress and collaborating with your team.</p>
          {from && (
            <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem' }}>
              Please authenticate to continue to <strong>{from}</strong>.
            </p>
          )}
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: '1.5rem' }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing you in...' : 'Sign in'}
            </button>
          </form>
          <div className="auth-footer">
            Need an account? <Link to="/register">Create a new workspace profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticationRequired(LoginPage);
