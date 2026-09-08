import { useState } from "react";
import TopicSelect from "./pages/TopicSelect";
import Worksheet from "./pages/Worksheet";
import Results from "./pages/Results";
import { submitGrade } from "./api";
import "./App.css";

// Screens: "select" -> "worksheet" -> "results", per Stage 6's self-navigation
// flow (icon-driven picks, one question per screen, feedback at the end).
function App() {
  const [screen, setScreen] = useState("select");
  const [topic, setTopic] = useState(null);
  const [subject, setSubject] = useState(null);
  const [grading, setGrading] = useState(null);
  const [error, setError] = useState(null);

  function handleTopicAndSubjectPicked(pickedTopic, pickedSubject) {
    setTopic(pickedTopic);
    setSubject(pickedSubject);
    setScreen("worksheet");
  }

  async function handleWorksheetComplete(answers) {
    try {
      const result = await submitGrade(topic, subject, answers);
      setGrading(result);
      setScreen("results");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleTryAgain() {
    setTopic(null);
    setSubject(null);
    setGrading(null);
    setScreen("select");
  }

  function handleFollowUp() {
    const nextSubject = subject === "math" ? "geography" : "math";
    setSubject(nextSubject);
    setGrading(null);
    setScreen("worksheet");
  }

  return (
    <div className="app">
      <header className="app-header">The Illumination Space</header>
      {error && <p className="error">{error}</p>}
      {screen === "select" && <TopicSelect onTopicAndSubjectPicked={handleTopicAndSubjectPicked} />}
      {screen === "worksheet" && (
        <Worksheet topic={topic} subject={subject} onComplete={handleWorksheetComplete} />
      )}
      {screen === "results" && (
        <Results grading={grading} onTryAgain={handleTryAgain} onFollowUp={handleFollowUp} />
      )}
    </div>
  );
}

export default App;
