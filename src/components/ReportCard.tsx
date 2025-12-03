import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { getBackendUrl } from "../helpers/backend.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";

function ReportCard({ report, onEdit, onDelete, onVote, onDownvote, upvoteCount, downvoteCount, myVotes }: { report: any, onEdit: any, onDelete: any, onVote: any, onDownvote: any, upvoteCount: number, downvoteCount: number, myVotes: Record<string, boolean> }) {
  const auth = useAuth();
  const isOwner = auth.user?.profile?.sub === report?.createdBy?.subject;
  const canEdit = isOwner

  const voteCount = report.vote_count ?? report.votes?.length ?? 0;
  const authorName = report.creator
    ? [report.createdBy.givenName, report.createdBy.familyName].filter(Boolean).join(' ')
    : 'Community member';

  const createdAt = report.created_at ? new Date(report.created_at) : null;
  const createdLabel = createdAt ? createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;
  const attachments = Array.isArray(report.images)
    ? report.images
    : typeof report.images === 'string'
    ? report.images.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
  const status = report.status || 'Open';
  const hasUpvoted = myVotes[report.id] === true;
  const hasDownvoted = myVotes[report.id] === false;
  const upvoteClass = hasUpvoted ? 'btn-secondary' : 'btn-ghost';
  const downvoteClass = hasDownvoted ? 'btn-secondary' : 'btn-ghost';

  return (
    <article className="card report-card">
      <div className="card-header">
        <div>
          <h3 style={{ margin: 0 }}>{report.name}</h3>
          <div className="report-meta">
            <span>By {authorName}</span>
            {createdLabel && <span>Posted {createdLabel}</span>}
            <span>Location: {report.location || 'Not specified'}</span>
          </div>
        </div>
        <span className="status-pill" data-status={status}>
          {status}
        </span>
      </div>

      <div className="card-body">
        <p style={{ margin: 0 }}>{report.content}</p>
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
          <button type="button" className={`btn ${upvoteClass}`} onClick={() => onVote(report.id)}>
            <FontAwesomeIcon icon={faThumbsUp} />  {upvoteCount}
          </button>
          <button type="button" className={`btn ${downvoteClass}`} onClick={() => onDownvote(report.id)}>
            <FontAwesomeIcon icon={faThumbsDown} /> {downvoteCount}
          </button>
        </div>
        <div className="card-actions">
          <Link to={`/reports/${report.id}`} className="btn btn-link">
            View details
          </Link>
          {canEdit && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => onEdit(report)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger" onClick={() => onDelete(report.id)}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default ReportCard;
