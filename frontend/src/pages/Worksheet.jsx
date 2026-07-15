import { useEffect, useState } from "react";
import { fetchWorksheet } from "../api";

// Stage 6: one question per screen, input matched to question type
// (number pad for numeric, tap-to-select for multiple-choice) — no open
// free-text interface exposed to the child.
export default function Worksheet({ subject, onComplete }) {
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentValue, setCurrentValue] = useState("");

  useEffect(() => {
    fetchWorksheet(subject)
      .then((data) => setQuestions(data.questions))
      .catch((err) => setError(err.message));
  }, [subject]);

  if (error) return <p className="error">Couldn't load the worksheet: {error}</p>;
  if (!questions) return <p className="loading">Loading your worksheet...</p>;

  const question = questions[index];
  const isLast = index === questions.length - 1;

  function handleNext() {
    const updatedAnswers = [...answers, { id: question.id, value: currentValue }];
    setAnswers(updatedAnswers);
    setCurrentValue("");

    if (isLast) {
      onComplete(updatedAnswers);
    } else {
      setIndex(index + 1);
    }
  }

  return (
    <div className="screen">
      <p className="progress">
        Question {index + 1} of {questions.length}
      </p>
      <h2>{question.prompt}</h2>

      {question.type === "numeric" && (
        <input
          className="numeric-input"
          type="number"
          inputMode="decimal"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          autoFocus
        />
      )}

      {question.type === "multiple-choice" && (
        <div className="options">
          {question.options.map((option) => (
            <button
              key={option}
              className={`option-button ${currentValue === option ? "selected" : ""}`}
              onClick={() => setCurrentValue(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <button
        className="primary-button"
        disabled={currentValue === ""}
        onClick={handleNext}
      >
        {isLast ? "Finish" : "Next"}
      </button>
    </div>
  );
}
