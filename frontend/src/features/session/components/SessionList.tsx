import { useSessions } from '../hooks/useSessions';

function SessionList() {
  const { sessions, loading, error } = useSessions();

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section>
      <h2>Sessions</h2>
      {sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li key={session.id}>
              <strong>{session.topicTitle}</strong> — {session.repetitions} reps
              <br />
              <small>by {session.username} on {new Date(session.sessionDate).toLocaleDateString()}</small>
              {session.notes && <p>{session.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SessionList;
