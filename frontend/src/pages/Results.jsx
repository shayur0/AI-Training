// Stage 8: specific, encouraging, fact-grounded feedback per question plus a
// positively-framed session summary and an adaptive follow-up suggestion.
export default function Results({ grading, onTryAgain, onFollowUp }) {
  const { results, sessionSummary } = grading;

  return (
    <div className="screen">
      <h1>
        You got {sessionSummary.correctCount} of {sessionSummary.totalCount} right!
      </h1>

      <div className="results-list">
        {results.map((result) => (
          <div key={result.id} className={`result-row ${result.correct ? "correct" : "revisit"}`}>
            <span className="result-icon">{result.correct ? "✅" : "💡"}</span>
            <p>{result.feedback}</p>
          </div>
        ))}
      </div>

      {sessionSummary.skillsMastered.length > 0 && (
        <p className="summary-line">
          <strong>Nice job on:</strong> {sessionSummary.skillsMastered.join(", ")}
        </p>
      )}
      {sessionSummary.skillsToRevisit.length > 0 && (
        <p className="summary-line">
          <strong>Let's revisit:</strong> {sessionSummary.skillsToRevisit.join(", ")}
        </p>
      )}

      <p className="follow-up">{sessionSummary.followUpSuggestion}</p>

      <div className="button-row">
        <button className="primary-button" onClick={onFollowUp}>
          Yes, let's go!
        </button>
        <button className="secondary-button" onClick={onTryAgain}>
          Pick something else
        </button>
      </div>
    </div>
  );
}
