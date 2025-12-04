import {useMemo, useRef, useState} from 'react';
import ReportForm from '../components/ReportForm.tsx';
import ReportCard from '../components/ReportCard.tsx';
import {useAuth, withAuthenticationRequired} from "react-oidc-context";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import useFetch from "../hooks/useFetch.ts";
import ServerConstant from "../constants/serverConstant.ts";

function ReportsPage() {
  const [saving, setSaving] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [filter, setFilter] = useState('all');
  const [votes, setVotes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const listSectionRef = useRef<HTMLTableSectionElement>(null);
  const [errorMessage, setError] = useState('');

  const auth = useAuth();
  const { get, post, put, del } = useFetch(auth, ServerConstant.ApiServer);

  const { data, isLoading: fetchLoading, isError, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const [problems, myProblems, myVotes, upvoteCount, downvoteCount, userInfo] = await Promise.all([
        get('api/problem'),
        get('api/problem/user'),
        get("api/problem/upvote-downvote/user"),
        get("api/problem/upvote-downvote/true"),
        get("api/problem/upvote-downvote/false"),
        get("api/userinfo"),
      ]);

      return { problems, myProblems, myVotes, upvoteCount, downvoteCount, userInfo };
    },
  });

  let isLoading = fetchLoading;
  const { problems, myProblems, myVotes, upvoteCount, downvoteCount, userInfo } = data || {};
  const queryClient = useQueryClient();

  const createReportMut = useMutation({
    mutationFn: (payload: any) => post("api/problem", payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      handleCloseForm();
    },
    onError: (err) =>
      setError(err.message || 'Failed to create report'),
  });

  isLoading = isLoading || createReportMut.isPending;

  const updateReportMut = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => put(`api/problem/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      handleCloseForm();
    },
    onError: (err) =>
      setError(err.message || 'Failed to update report'),
  });
  isLoading = isLoading || updateReportMut.isPending;

  const deleteReportMut = useMutation({
    mutationFn: (id) => del(`api/problem/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
    },
    onError: (err) => {
      queryClient.invalidateQueries(['reports']);
      setError(err.message || 'Failed to delete report');
    }
  });
  isLoading = isLoading || deleteReportMut.isPending;

  const toggleVoteMut = useMutation({
    mutationFn: ({id, isUpvote}: { id: string, isUpvote: boolean }) => put(`api/problem/${id}/upvote-downvote/${isUpvote}`),
    onSuccess: () => queryClient.invalidateQueries(['reports']),
    onError: (err) =>
      setError(err.message || 'Failed to vote'),
  });

  const displayedReports = useMemo(() => {
    if (filter === 'mine') {
      return myProblems;
    }
    if (filter === 'open') {
      return problems.filter((report) => report.status === 'Open');
    }
    return problems;
  }, [filter, problems, myProblems]);

  const stats = useMemo(() => {
    if (!problems) return {
      total: 0,
      open: 0,
      resolved: 0,
      contributions: 0,
      votesCast: 0,
    };

    const total = problems.length;
    const open = problems.filter((report) => !report.status || report.status === 'Open').length;
    const resolved = problems.filter((report) => report.status === "Closed").length;
    const contributions = myProblems.length;
    const votesCast = myVotes?.length;

    return {
      total,
      open,
      resolved,
      contributions,
      votesCast,
    };
  }, [problems, myProblems, votes]);

  const handleCloseForm = () => {
    setEditingReport(null);
    setIsFormOpen(false);
    setError('');
  };

  const handleStartNewReport = () => {
    setEditingReport(null);
    setError('');
    setIsFormOpen(true);
  };

  const handleEditReport = (item) => {
    setEditingReport(item);
    setError('');
    setIsFormOpen(true);
  };

  const handleViewMySubmissions = () => {
    setFilter('mine');
    if (listSectionRef.current) {
      listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleCloseForm();
    }
  };

  const handleCreateReport = (payload: any) => {
    setError('');
    createReportMut.mutate(payload);
  };

  const handleUpdateReport = (payload: any) => {
    if (!editingReport) return;
    setError('');
    updateReportMut.mutate({ payload, id: editingReport.id });
  };

  const handleDeleteReport = (id: string) => {
    if (!window.confirm('Delete this report?')) return;
    setError('');
    deleteReportMut.mutate(id);
  };

  const handleVote = (id: string, isUpvote: boolean) => {
    setError('');
    if (myVotes[id] !== undefined) {
      if (myVotes[id]) {
        if (isUpvote) {
          upvoteCount.value = upvoteCount.value - 1;
        } else {
          upvoteCount.value = upvoteCount.value - 1;
          downvoteCount.value = downvoteCount.value + 1;
        }
      } else {
        if (isUpvote) {
          upvoteCount.value = upvoteCount.value + 1;
          downvoteCount.value = downvoteCount.value - 1;
        } else {
          downvoteCount.value = downvoteCount.value - 1;
        }
      }
    }
    if (isUpvote) {
      upvoteCount.value = upvoteCount.value + 1;
    } else {
      downvoteCount.value = downvoteCount.value + 1 ;
    }
    toggleVoteMut.mutate({id, isUpvote});
  };

  return (
    <div className="container page-stack">
      <header className="page-header">
        <div>
          <h1>Reports workspace</h1>
          <p className="section-subtitle">
            Track issues, highlight wins, and keep everyone aligned
            {userInfo?.name ? `, ${userInfo?.givenName}` : ''}.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-ghost" onClick={handleViewMySubmissions}>
            View my submissions
          </button>
          <button type="button" className="btn btn-primary" onClick={handleStartNewReport}>
            Start a new report
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total reports</h4>
          <div className="stat-value">{stats.total}</div>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted)' }}>All tracked initiatives in the workspace.</p>
        </div>
        <div className="stat-card">
          <h4>Active now</h4>
          <div className="stat-value">{stats.open}</div>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted)' }}>
            Open reports waiting on action ({stats.resolved} resolved to date).
          </p>
        </div>
        <div className="stat-card">
          <h4>Contributions</h4>
          <div className="stat-value">{stats.contributions}</div>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted)' }}>Reports submitted by you.</p>
        </div>
        <div className="stat-card">
          <h4>Votes cast</h4>
          <div className="stat-value">{stats.votesCast}</div>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted)' }}>Signals you or teammates prioritized.</p>
        </div>
      </div>

      <section className="card" ref={listSectionRef}>
        <div className="card-header">
          <div>
            <h2>Active reports</h2>
            <p className="section-subtitle">
              Move through submissions, add updates, and vote on what matters most.
            </p>
          </div>
          <div className="filter-group">
            <label htmlFor="report-filter">View</label>
            <select
              id="report-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter reports"
            >
              <option value="all">All reports</option>
              <option value="mine">My reports</option>
              <option value="open">Open only</option>
            </select>
          </div>
        </div>
        {isLoading ? (
          <div className="loading-state" style={{ padding: '2rem 0' }}>
            <span className="spinner" aria-hidden="true" />
            <span>Loading reports...</span>
          </div>
        ) : (
          <div className="list-stack" style={{ marginTop: '1.5rem' }}>
            {displayedReports ? displayedReports?.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onEdit={handleEditReport}
                onDelete={handleDeleteReport}
                onVote={() => handleVote(report.id, true)}
                upvoteCount={upvoteCount[report.id] ?? 0}
                downvoteCount={downvoteCount[report.id] ?? 0}
                myVotes={myVotes}
                onDownvote={() => handleVote(report.id, false)}/>
            )) :
              <div className="empty-state">
                <h3 style={{ marginTop: 0 }}>No reports found</h3>
                <p style={{ margin: 0 }}>
                  Try switching the filter or start a new report to capture what you are seeing on the ground.
                </p>
              </div>}
          </div>
        )}
      </section>

      {isFormOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-form-title"
          onClick={handleOverlayClick}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2 id="report-form-title">{editingReport ? 'Update report' : 'Create a report'}</h2>
                <p className="section-subtitle">
                  {editingReport
                    ? 'Refine the details and keep collaborators in the loop.'
                    : 'Share the impact, location, and support needed to give your team a head start.'}
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={handleCloseForm}
                aria-label="Close report form"
              >
                Close
              </button>
            </div>
            {error && (
              <div className="alert alert-error" role="alert">
                {errorMessage}
              </div>
            )}
            <ReportForm
              onSubmit={editingReport ? handleUpdateReport : handleCreateReport}
              submitting={saving}
              initialData={editingReport}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuthenticationRequired(ReportsPage);
