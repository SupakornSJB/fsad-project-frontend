import { useState } from 'react';
import { Link } from 'react-router-dom';
import { withAuthenticationRequired } from "react-oidc-context";

function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    bio: '',
    avatar: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await register(form);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-wrapper">
        <Link to="/" className="back-link">
          Back to home
        </Link>
        <div className="auth-card" role="form" aria-labelledby="register-title">
          <h2 id="register-title">Create your workspace profile</h2>
          <p>
            Tell us a little about yourself so teammates know who is pushing initiatives forward. You can always
            update these details later.
          </p>
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: '1.5rem' }}>
            <div className="grid-two">
              <div className="form-field">
                <label htmlFor="first_name">First name</label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="form-field">
                <label htmlFor="last_name">Last name</label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="email">Work email</label>
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
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <p className="form-help">Use a passphrase for extra security.</p>
            </div>

            <div className="form-field">
              <label htmlFor="bio">Short bio (optional)</label>
              <textarea
                id="bio"
                name="bio"
                placeholder="What team are you on? What projects excite you?"
                value={form.bio}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-field">
              <label htmlFor="avatar">Avatar URL (optional)</label>
              <input
                id="avatar"
                type="text"
                name="avatar"
                placeholder="https://..."
                value={form.avatar}
                onChange={handleChange}
                autoComplete="photo"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating your profile...' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer">
            Already part of UPTS? <Link to="/login">Sign in to your account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticationRequired(RegisterPage);
