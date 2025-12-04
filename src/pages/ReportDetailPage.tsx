import {useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useAuth} from "react-oidc-context";
import CommentList from '../components/CommentList.tsx';
import SolutionList from '../components/SolutionList.tsx';
import {getBackendUrl} from "../helpers/backend.ts";
import useFetch from "../hooks/useFetch.ts";
import ServerConstant from "../constants/serverConstant.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getErrMsg} from "../helpers/error.ts";
import { withAuthenticationRequired} from "react-oidc-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";

function ReportDetailPage() {
  const qc = useQueryClient();
  const { id } = useParams();
  const reportId = id;
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [solutionStatus, setSolutionStatus] = useState('Pending');
  const [error, setError] = useState('');

  const auth  = useAuth();
  const { get, post, put, del } = useFetch(auth, ServerConstant.ApiServer)

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await get("api/userInfo");
    },
  })

  const { data: problem, isLoading: problemLoading, isError: problemError } = useQuery({
    queryKey: ['reports', reportId],
    queryFn: () => get(`api/problem/${reportId}`),
  })

  const { data: voteDetail, isLoading: voteDetailLoading, isError: voteDetailError }  = useQuery({
    queryKey: ['vote', reportId],
    queryFn: async () => {
      const [upvote, downvote, userVote] = await Promise.all([
        get(`api/problem/upvote-downvote/true/`).then(res => res[reportId] ?? 0),
        get(`api/problem/upvote-downvote/false/`).then(res => res[reportId] ?? 0),
        get(`api/problem/upvote-downvote/user/`)
      ])
      return { upvote, downvote, userVote }
    }
  })

  const hasUpvoted = voteDetail?.userVote[reportId] === true;
  const hasDownvoted = voteDetail?.userVote[reportId] === false;
  const upvoteClass = hasUpvoted ? 'btn-secondary' : 'btn-ghost';
  const downvoteClass = hasDownvoted ? 'btn-secondary' : 'btn-ghost';

  const deleteReportMut = useMutation({
    mutationFn: (id: string) => del('api/problem/' + id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['reports'] });
      navigate('/reports');
    },
    onError: (err) => setError(getErrMsg(err)),
  });

  const createCommentMut = useMutation({
    mutationFn: (payload: { id: string; content: string }) => post(`api/problemcomment/${payload.id}`, { content: payload.content }),
    onSuccess: async () => {
      setCommentText('');
      await qc.invalidateQueries({ queryKey: ['reports', reportId] });
    },
    onError: (err) => setError(getErrMsg(err)),
  });

  const updateCommentMut = useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string | number; payload: any }) => put(`api/problemcomment/${reportId}/${commentId}`, { content: payload.content }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['reports', reportId] });
    },
    onError: (err) => setError(getErrMsg(err)),
  });

  const deleteCommentMut = useMutation({
    mutationFn: (commentId: string | number) => del(`api/problemcomment/${reportId}/${commentId}`),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['reports', reportId] });
    },
    onError: (err) => setError(getErrMsg(err)),
  });

  const createSolutionMut = useMutation({
    mutationFn: (payload: { id: string; content: string; status: string }) => post(`api/solution/${reportId}`, payload),
     onSuccess: async () => {
      setSolutionText('');
      setSolutionStatus('Pending');
      await qc.invalidateQueries({ queryKey: ['reports', reportId] });
    },
    onError: (err) => setError(getErrMsg(err)),
  });

  const updateSolutionMut = useMutation({
    mutationFn: ({ solutionId, payload }: { solutionId: string ; payload: any }) => post(`api/solution/${reportId}/${solutionId}`, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['reports', reportId] });
    },
    onError: (err) => setError(getErrMsg(err)),
  });

  const deleteSolutionMut = useMutation({
    mutationFn: (solutionId: string ) => del(`api/solution/${reportId}/${solutionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports', reportId]});
    },
    onError: (err) => setError(getErrMsg(err)),
  });

  const voteMut = useMutation({
    mutationFn: (payload: { reportId: string, isUpvote: boolean }) => put(`api/problem/${reportId}/upvote-downvote/${payload.isUpvote}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vote']});
    },
    onError: (err) => setError(getErrMsg(err)),
  });

  const handleDeleteReport = () => {
    if (!window.confirm('Delete this report?')) return;
    setError('');
    deleteReportMut.mutate(reportId);
  };

  const handleCreateComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    setError('');
    await createCommentMut.mutateAsync({ id: reportId, content: commentText });
  };

  const handleUpdateComment = (commentId: number | string, payload: any) => {
    setError('');
    updateCommentMut.mutate({ commentId, payload });
  };

  const handleDeleteComment = (commentId: number | string) => {
    setError('');
    deleteCommentMut.mutate(commentId);
  };

  const handleCreateSolution = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!solutionText.trim()) return;
    setError('');
    await createSolutionMut.mutateAsync({
      id: reportId,
      content: solutionText,
      status: solutionStatus,
    });
  };

  const handleUpdateSolution = (solutionId: number | string, payload: any) => {
    setError('');
    updateSolutionMut.mutate({ solutionId, payload });
  };

  const handleDeleteSolution = (solutionId: number | string) => {
    setError('');
    deleteSolutionMut.mutate(solutionId);
  };

  const handleVote = (reportId: string, isUpvote: boolean) => {
    setError('');
    voteMut.mutate({ reportId, isUpvote });
  };

  if (problemLoading) {
    return (
      <div className="container loading-state">
        <span className="spinner" aria-hidden="true" />
        <span>Loading report...</span>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container page-stack">
        <div className="empty-state">
          <h2 style={{ marginTop: 0 }}>Report not found</h2>
          <p>This report may have been archived or removed.</p>
          <Link to="/reports" className="btn btn-primary">
            Back to reports
          </Link>
        </div>
      </div>
    );
  }

  const canModifyReport = user?.id === problem?.createdBy?.subject || user?.role === 'admin';
  const attachments = Array.isArray(problem.images)
    ? problem.images
    : typeof problem.images === 'string'
    ? problem.images.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
  const createdLabel = problem.created_at
    ? new Date(problem.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const updatedLabel = problem.updated_at
    ? new Date(problem.updated_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;
  const authorName = problem.createdBy
    ? [problem.createdBy.first_name, problem.createdBy.last_name].filter(Boolean).join(' ')
    : 'Community member';
  const status = problem.status || 'Open';

  return (
    <div className="container page-stack">
      <Link to="/reports" className="back-link">
        Back to reports
      </Link>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <section className="card">
        <div className="card-header">
          <div>
            <h2>{problem.name}</h2>
            <div className="report-meta">
              <span>By {authorName}</span>
              {createdLabel && <span>Created {createdLabel}</span>}
              {updatedLabel && updatedLabel !== createdLabel && <span>Updated {updatedLabel}</span>}
              <span>Location: {problem.location || 'Not specified'}</span>
            </div>
          </div>
          <span className="status-pill" data-status={status}>
            {status}
          </span>
        </div>
        <div className="card-body">
          <p style={{ margin: 0 }}>{problem.content}</p>
          {attachments.length > 0 && (
            <div className="attachment-list">
              {attachments.map((link, index) => {
                const resolvedLink = getBackendUrl(link);
                return (
                  <a key={`${link}-${index}`} className="chip" href={resolvedLink} target="_blank" rel="noreferrer">
                    Attachment {index + 1}
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <div className="card-footer">
          <div className="vote-actions">
            <button type="button" className={`btn ${upvoteClass}`} onClick={() => handleVote(problem.id, true)}>
              <FontAwesomeIcon icon={faThumbsUp} /> {voteDetail?.upvote}
            </button>
            <button type="button" className={`btn ${downvoteClass}`} onClick={() => handleVote(problem.id, false)}>
              <FontAwesomeIcon icon={faThumbsDown} /> {voteDetail?.downvote}
            </button>
          </div>
          <div className="card-actions">
            {canModifyReport && (
              <button type="button" className="btn btn-danger" onClick={handleDeleteReport}>
                Delete report
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Comments</h3>
            <p className="section-subtitle">Keep stakeholders aligned with quick updates.</p>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateComment} className="form-grid">
            <div className="form-field">
              <label htmlFor="comment-text">Add a comment</label>
              <textarea
                id="comment-text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Share context, an update, or ask a question."
                rows={3}
              />
            </div>
            <div className="comment-actions">
              <button type="submit" className="btn btn-primary" disabled={!commentText.trim()}>
                Post comment
              </button>
            </div>
          </form>
          <CommentList comments={problem.comments} onUpdate={handleUpdateComment} onDelete={handleDeleteComment} />
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Solutions</h3>
            <p className="section-subtitle">Capture the ideas and actions driving this report forward.</p>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreateSolution} className="form-grid">
            <div className="form-field">
              <label htmlFor="solution-text">Propose a solution</label>
              <textarea
                id="solution-text"
                value={solutionText}
                onChange={(event) => setSolutionText(event.target.value)}
                placeholder="Outline the plan, required support, or recent progress."
                rows={3}
              />
            </div>
            <div className="grid-two">
              <div className="form-field">
                <label htmlFor="solution-status">Status</label>
                <select
                  id="solution-status"
                  value={solutionStatus}
                  onChange={(event) => setSolutionStatus(event.target.value)}
                >
                  {['Pending', 'In Progress', 'Completed'].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="solution-actions">
              <button type="submit" className="btn btn-primary" disabled={!solutionText.trim()}>
                Share solution
              </button>
            </div>
          </form>
          <SolutionList solutions={problem.solutions} onUpdate={handleUpdateSolution} onDelete={handleDeleteSolution} />
        </div>
      </section>
    </div>
  );
}

export default withAuthenticationRequired(ReportDetailPage);
