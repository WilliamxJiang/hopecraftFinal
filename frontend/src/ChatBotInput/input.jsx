import React from 'react';

const InputSection = ({ onSubmit }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userPrompt = e.target.elements.prompt.value;

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();
      if (onSubmit) {
        onSubmit(data.videoUrl);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <section className="input-container">
      <img src="hopecraftsymbol.png" alt="Banner" className="banner-image" />
      <h1>are you feeling down? let’s change your perspective</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          name="prompt"
          placeholder="write us a prompt about your issues, and we’ll generate inspirational content to change your perspectives! ..."
          rows="4"
          className="user-input"
        ></textarea>
        <button type="submit" className="submit-button">
          Generate Hope
        </button>
      </form>
    </section>
  );
};

export default InputSection;