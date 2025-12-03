import {useMemo, useState} from 'react';
import {useAuth, withAuthenticationRequired} from "react-oidc-context";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import useFetch from "../hooks/useFetch.ts";
import ServerConstant from "../constants/serverConstant.ts";

function ProfilePage() {
  const auth = useAuth()
  const { get } = useFetch(auth, ServerConstant.ApiServer);
  const { put } = useFetch(auth, ServerConstant.IdentityServer);
  const [status, setStatus] = useState<{message: string, type: string} | null>(null);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const [form, setForm] = useState<{given_name: string, family_name: string, bio: string, avatar: string} | null>(null)

  const { data: user, isLoading } = useQuery<Record<string, string>>({
    queryFn: async () => {
      const user: Record<string, string> = await get("api/userInfo")
      if (user) {
        setForm({
          given_name: user?.given_name || '',
          family_name: user?.family_name || '',
          bio: user?.bio || '',
          avatar: user?.avatar || '',
        })
      }
      return user
    },
    queryKey: ["userInfo"],
  })

  const updateProfileMutation = useMutation({
    mutationFn: async ({data, subject}: { data: any, subject: string })  => {
      return await put(`api/userManager/${subject}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries(["userInfo"]);
      setSaving(false);
      setStatus({
        message: 'Profile updated successfully',
        type: 'success'
      });
    },
    onError: (error) => {
      setStatus({
        message: error.message,
        type: 'error',
      });
    }
  });

  const initials = useMemo(() => {
    const first = form?.given_name?.[0] || user?.given_name?.[0];
    const last = form?.family_name?.[0] || user?.family_name?.[0];
    return [first, last].filter(Boolean).join('').toUpperCase() || 'U';
  }, [form?.given_name, form?.family_name, user?.given_name, user?.family_name]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    updateProfileMutation.mutate({ data: form, subject: user?.subject });
  };

  return (
    <div className="container page-stack">
      <header className="page-header">
        <div>
          <h1>My profile</h1>
          <p className="section-subtitle">Share a bit about yourself so collaborators know who to reach out to.</p>
        </div>
      </header>

      <section className="card" style={{ maxWidth: '640px' }}>
        <div className="profile-head">
          {form?.avatar ? (
            <img src={form.avatar} alt="Avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar placeholder" aria-hidden="true">
              {initials}
            </div>
          )}
          <div>
            <h2 style={{ margin: '0 0 0.25rem' }}>
              {[form?.given_name || user?.givenName, form?.family_name || user?.familyName].filter(Boolean).join(' ') ||
                'Your Name'}
            </h2>
            <p style={{ margin: 0, color: 'var(--color-muted)' }}>{user?.email}</p>
            <span className="badge" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>{user?.role}</span>
          </div>
        </div>

        {status && (
          <div
            className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`}
            role="status"
            style={{ marginTop: '1.5rem' }}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: '1.75rem' }}>
          <div className="grid-two">
            <div className="form-field">
              <label htmlFor="first_name">First name</label>
              <input
                id="first_name"
                type="text"
                name="given_name"
                placeholder="First name"
                value={form?.given_name}
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
                name="family_name"
                placeholder="Last name"
                value={form?.family_name}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="bio">Short bio</label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Share your focus areas, responsibilities, or a quick introduction."
              value={form?.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-field">
            <label htmlFor="avatar">Avatar URL</label>
            <input
              id="avatar"
              type="text"
              name="avatar"
              placeholder="https://example.com/avatar.jpg"
              value={form?.avatar}
              onChange={handleChange}
              autoComplete="photo"
            />
            <p className="form-help">Paste a public image link. Square images work best.</p>
          </div>

          <div className="profile-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving profile...' : 'Update profile'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default withAuthenticationRequired(ProfilePage);
