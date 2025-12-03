import { useEffect, useMemo, useState } from 'react';
import { fetchAuditLogs } from '../api/auditLogs.ts';
import {withAuthenticationRequired} from "react-oidc-context";

const METHODS = ['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const PAGE_SIZE = 100;

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ method: 'ALL', userEmail: '', statusCode: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    async function loadLogs() {
      setLoading(true);
      setError('');
      try {
        const entries = await fetchAuditLogs({
          skip: 0,
          limit: PAGE_SIZE,
          method: filters.method,
          userEmail: filters.userEmail.trim() || undefined,
          statusCode: filters.statusCode ? Number(filters.statusCode) : undefined,
        });
        if (!isSubscribed) return;
        setLogs(entries);
        setHasMore(entries.length === PAGE_SIZE);
      } catch (err) {
        if (!isSubscribed) return;
        setError(err.response?.data?.detail || 'Failed to load audit logs');
      } finally {
        if (isSubscribed) {
          setLoading(false);
          setIsLoadingMore(false);
        }
      }
    }

    loadLogs();

    return () => {
      isSubscribed = false;
    };
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefresh = () => {
    // Trigger useEffect by resetting filters to same values (clone)
    setFilters((prev) => ({ ...prev }));
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const entries = await fetchAuditLogs({
        skip: logs.length,
        limit: PAGE_SIZE,
        method: filters.method,
        userEmail: filters.userEmail.trim() || undefined,
        statusCode: filters.statusCode ? Number(filters.statusCode) : undefined,
      });
      setLogs((prev) => [...prev, ...entries]);
      setHasMore(entries.length === PAGE_SIZE);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load more audit logs');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderedLogs = useMemo(() => logs, [logs]);

  return (
    <div className="container page-stack">
      <header className="page-header">
        <div>
          <h1>Audit activity</h1>
          <p className="section-subtitle">
            Review every API call made across UPTS to keep administrators in the loop.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-ghost" onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      </header>

      <section className="card">
        <div className="card-body" style={{ gap: '1rem' }}>
          <form className="filter-group" style={{ alignItems: 'flex-end' }}>
            <div className="form-field" style={{ minWidth: '160px' }}>
              <label htmlFor="method">Method</label>
              <select id="method" name="method" value={filters.method} onChange={handleFilterChange}>
                {METHODS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="userEmail">User email</label>
              <input
                id="userEmail"
                type="email"
                name="userEmail"
                placeholder="team@domain.com"
                value={filters.userEmail}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-field" style={{ maxWidth: '140px' }}>
              <label htmlFor="statusCode">Status</label>
              <input
                id="statusCode"
                type="number"
                name="statusCode"
                placeholder="200"
                value={filters.statusCode}
                onChange={handleFilterChange}
                min="100"
                max="599"
              />
            </div>
          </form>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <span className="spinner" aria-hidden="true" />
              <span>Loading audit logs…</span>
            </div>
          ) : renderedLogs.length ? (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Status</th>
                    <th>IP</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {renderedLogs.map((log) => (
                    <tr key={log.log_id}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td style={{ maxWidth: '220px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{log.email || 'Anonymous'}</span>
                          {log.user_id && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                              User ID: {log.user_id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge">{log.method}</span>
                      </td>
                      <td style={{ maxWidth: '320px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{log.path}</span>
                          {log.query_params && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                              ?{log.query_params}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{log.status_code}</td>
                      <td>{log.ip_address || '—'}</td>
                      <td>{typeof log.duration_ms === 'number' ? `${log.duration_ms} ms` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3 style={{ marginTop: 0 }}>No audit activity yet</h3>
              <p style={{ margin: 0 }}>Activity will appear here as soon as teammates start using the workspace.</p>
            </div>
          )}

          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default withAuthenticationRequired(AuditLogsPage);
