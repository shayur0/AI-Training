import { useEffect, useState } from "react";
import { fetchTopics } from "../api";

// Stage 1 / Stage 6: curated icon cards only for the child — no free-text
// topic search in Phase 1 (decisions/decision.md #1).
export default function TopicSelect({ onSubjectPicked }) {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopics()
      .then((data) => setTopics(data.topics))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="error">Couldn't load topics: {error}</p>;
  }

  return (
    <div className="screen">
      <h1>What do you want to explore today?</h1>
      {topics.map((topic) => (
        <div key={topic.id} className="topic-card">
          <div className="topic-title">
            <span className="icon">{topic.icon}</span> {topic.label}
          </div>
          <p className="hint">Pick a subject to start</p>
          <div className="subject-row">
            {topic.subjects.map((subject) => (
              <button
                key={subject.id}
                className="subject-button"
                onClick={() => onSubjectPicked(subject.id)}
              >
                <span className="icon">{subject.icon}</span>
                {subject.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
