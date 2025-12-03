import { useState } from 'react';
import { deleteUser } from '../api/users.ts';
import { useAuth } from "react-oidc-context";
import { withAuthenticationRequired } from "react-oidc-context";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import useFetch from "../hooks/useFetch.ts";
import ServerConstant from "../constants/serverConstant.ts";

function UsersAdminPage() {
  const [error, setError] = useState('');

  const auth = useAuth();
  const { get } = useFetch(auth, ServerConstant.ApiServer);
  const { get: identityGet } = useFetch(auth, ServerConstant.IdentityServer);
  const qc = useQueryClient();

  const { data: users, isLoading: allLoading, isError: allError } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      return await identityGet("api/userManager/all");
    }
  })

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await get("api/userInfo");
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async ({subject}: { subject: string })  => {
      return await deleteUser(subject);
    },
    onSuccess: () => {
      qc.invalidateQueries(['currentUser']);
    }
  });

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.subject) {
      setError('You cannot delete yourself.');
      return;
    }
    if (!window.confirm('Delete this user?')) return;
    setError('');
    try {
      await deleteUserMutation.mutate({ subject: userId });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  return (
    <div className="container page-stack">
      <header className="page-header">
        <div>
          <h1>Workspace members</h1>
          <p className="section-subtitle">Manage access and visibility for everyone collaborating in UPTS.</p>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <section className="card">
        {isLoading ? (
          <div className="loading-state">
            <span className="spinner" aria-hidden="true" />
            <span>Loading users...</span>
          </div>
        ) : users?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{user.userName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>ID: {user.id}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge">{user.role}</span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-danger" onClick={() => handleDeleteUser(user.user_id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No members found.</div>
        )}
      </section>
    </div>
  );
}

export default withAuthenticationRequired(UsersAdminPage);
