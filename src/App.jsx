import React, { useState, useRef } from 'react';
import './App.css';
import Input from './ChatBotInput/input';
import Output from './VideoDisplay/Output';
import './ChatBotInput/input.css';
import './VideoDisplay/Output.css';

const App = () => {
  const [submitted, setSubmitted] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const inputContainerRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Called when the user presses "Generate Hope"
  const handlePromptSubmit = (videoUrl) => {
    setVideoUrl(videoUrl);

    // Show the Output component (video page)
    setSubmitted(true);

    // Wait a tick so Output is mounted in the DOM
    setTimeout(() => {
      if (videoContainerRef.current) {
        const videoElement = videoContainerRef.current.querySelector('video');
        if (videoElement && videoElement.requestFullscreen) {
          videoElement.requestFullscreen().catch((err) => {
            console.warn('Fullscreen request was blocked or failed.', err);
          });
        }
      }
    }, 100);
  };

  // Reset to input page
  const handleReset = () => {
    setSubmitted(false);
    setVideoUrl('');
  };

  return (
    <div className="App">
      {!submitted ? (
        <div ref={inputContainerRef}>
          <Input onSubmit={handlePromptSubmit} />
        </div>
      ) : (
        <Output
          videoUrl={videoUrl}
          containerRef={videoContainerRef}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default App;