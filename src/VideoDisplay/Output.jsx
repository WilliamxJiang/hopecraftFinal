import React, { useEffect, useRef, useState } from 'react';
import { GoShare } from "react-icons/go";
import { VscDebugRestart } from "react-icons/vsc";
import './Output.css';

const Output = ({ videoUrl, containerRef, onReset }) => {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showButtons, setShowButtons] = useState(false); // hidden initially

  // Once video ends, show "Replay" & "Generate Another"
  const handleVideoEnded = () => {
    setShowButtons(true);
  };

  // Replay functionality
  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setShowButtons(false); // Hide again while replaying
      videoRef.current.play();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Check out this hopeful video!',
      text: 'I found this uplifting content. Take a look!',
      url: window.location.origin, // Share your website's URL or a specific link
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Shared successfully');
      } catch (err) {
        console.warn('Share canceled or failed', err);
      }
    } else {
      // Fallback: copy the URL to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard. Share it with your friends!');
    }
  };

  // Listen for native fullscreen changes (ESC pressed, etc.)
  useEffect(() => {
    const onFullScreenChange = () => {
      // If there's no fullscreen element, user is out of fullscreen
      const isFullscreen = !!document.fullscreenElement;
      if (containerRef.current) {
        if (isFullscreen) {
          containerRef.current.classList.add('fullscreen');
        } else {
          containerRef.current.classList.remove('fullscreen');
        }
      }
    };

    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    const handlePlay = () => {
      if (containerRef.current) {
        containerRef.current.classList.add('fullscreen');
        setIsFullscreen(true);
      }
    };

    if (videoElement) {
      videoElement.addEventListener('play', handlePlay);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('play', handlePlay);
      }
    };
  }, [containerRef]);

  return (
    <section className="video-container" ref={containerRef}>
      {videoUrl ? (
        <video
          ref={videoRef}
          className="video-player"
          // No 'loop' => will stop at the end
          autoPlay
          controls
          onEnded={handleVideoEnded}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Loading video...</p>
      )}

      {showButtons && (
        <div className="button-section">
          <button className="circular-button" onClick={handleReplay} title="Replay">
            <VscDebugRestart className="button-icon" />
          </button>

          <button className="circular-button" onClick={onReset} title="Reprompt">
            <span className="button-text">Reprompt</span>
          </button>

          <button className="circular-button" onClick={handleShare}>
            <GoShare className="button-icon" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Output;