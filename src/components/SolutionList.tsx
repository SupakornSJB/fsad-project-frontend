import {useState} from 'react';
import {useAuth} from 'react-oidc-context';
import {useQuery} from "@tanstack/react-query";
import useFetch from "../hooks/useFetch.ts";
import ServerConstant from "../constants/serverConstant.ts";

const statusOptions = ['Pending', 'In Progress', 'Completed'];

function SolutionList({ solutions, onUpdate, onDelete }) {
  const auth = useAuth();
  const { get } = useFetch(auth, ServerConstant.ApiServer);
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await get("api/userInfo");
    },
  })
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ content: '', status: 'Pending' });

  const startEdit = (solution) => {
    setEditingId(solution.id);
    setDraft({ content: solution.content, status: solution.status });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ content: '', status: 'Pending' });
  };

  const submitEdit = (solutionId) => {
    onUpdate(solutionId, draft);
    cancelEdit();
  };

  if (!solutions?.length) {
    return <div className="empty-state">No solutions shared yet. Propose the first pathway forward.</div>;
  }

  return (
    <div className="list-stack solution-list">
      {solutions.map((solution) => {
        const canModify = user?.role === 'admin' || user?.subject === solution.createdBy?.subject;
        const authorName = solution?.createdBy
          ? [solution?.createdBy?.givenName, solution?.createdBy?.familyName].filter(Boolean).join(' ')
          : 'Community member';

        return (
          <article key={solution.id} className="solution-card">
            <div className="solution-header">
              <div>
                <strong>{authorName}</strong>
                <div className="meta">
                  <span>Status updated {new Date(solution.updatedAt || solution.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <span className="status-pill" data-status={solution.status}>
                {solution.status}
              </span>
            </div>

            {editingId === solution.id ? (
              <div className="solution-body">
                <textarea
                  value={draft.content}
                  onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
                  rows={3}
                />
                <select
                  value={draft.status}
                  onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="solution-actions">
                  <button type="button" className="btn btn-primary" onClick={() => submitEdit(solution.id)}>
                    Save solution
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="solution-text">{solution.content}</p>
            )}

            {canModify && editingId !== solution.id && (
              <div className="solution-actions">
                <button type="button" className="btn btn-ghost" onClick={() => startEdit(solution)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => onDelete(solution.id)}>
                  Delete
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default SolutionList;
