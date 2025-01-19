import React, { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState("uplifting");
  const [videoLink, setVideoLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a delay and mock video link
    setTimeout(() => {
      setVideoLink("https://samplelib.com/lib/preview/mp4/sample-5s.mp4"); // Example video
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hopecore Video Generator</h1>
        <p>Enter a prompt and let us create a motivational video for you!</p>

        <form onSubmit={handleSubmit} className="form-container">
          <textarea
            className="input-prompt"
            placeholder="What's on your mind? (e.g., 'I feel stuck')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />

          <label className="mood-label">
            Choose a mood:
            <select
              className="mood-select"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            >
              <option value="uplifting">Uplifting</option>
              <option value="calm">Calm</option>
              <option value="energetic">Energetic</option>
            </select>
          </label>

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Create Video"}
          </button>
        </form>

        {videoLink && (
          <div className="video-container">
            <h2>Your Video</h2>
            <video src={videoLink} controls className="generated-video" />
            <a href={videoLink} download className="download-button">
              Download Video
            </a>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
