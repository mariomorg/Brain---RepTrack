import { useTopics } from '../hooks/useTopics';

function TopicList() {
  const { topics, loading, error } = useTopics();

  if (loading) return <p>Loading topics...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section>
      <h2>Topics</h2>
      {topics.length === 0 ? (
        <p>No topics found.</p>
      ) : (
        <ul>
          {topics.map((topic) => (
            <li key={topic.id}>
              <strong>{topic.title}</strong>
              {topic.description && <p>{topic.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TopicList;
