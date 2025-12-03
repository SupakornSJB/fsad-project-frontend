import {useState} from 'react';
import {useAuth} from 'react-oidc-context';
import useFetch from "../hooks/useFetch.ts";
import ServerConstant from "../constants/serverConstant.ts";
import {useQuery} from "@tanstack/react-query";

function CommentList({ comments, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const auth = useAuth();
  const { get } = useFetch(auth, ServerConstant.ApiServer);
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await get("api/userInfo");
    },
  })

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setDraft(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft('');
  };

  const submitEdit = (commentId) => {
    onUpdate(commentId, { content: draft });
    cancelEdit();
  };

  if (!comments?.length) {
    return <div className="empty-state">No comments yet. Kick off the conversation.</div>;
  }

  return (
    <div className="list-stack comment-list">
      {comments.map((comment) => {
        const canModify = user?.role === 'admin' || user?.subject === comment?.createdBy?.subject;
        const authorName = comment?.createdBy
          ? [comment?.createdBy?.givenName, comment?.createdBy?.familyName].filter(Boolean).join(' ')
          : 'Community member';
        const createdLabel = new Date(comment.createdAt).toLocaleString();

        return (
          <article key={comment.id} className="comment-card">
            <div className="comment-header">
              <div>
                <strong>{authorName}</strong>
                <div className="meta">
                  <span>{createdLabel}</span>
                </div>
              </div>
              {canModify && editingId !== comment.id && (
                <div className="comment-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => startEdit(comment)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => onDelete(comment.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>

            {editingId === comment.id ?  (
              <div className="comment-body">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={3}
                />
                <div className="comment-actions">
                  <button type="button" className="btn btn-primary" onClick={() => submitEdit(comment.id)}>
                    Save changes
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="comment-text">{comment.content}</p>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default CommentList;
